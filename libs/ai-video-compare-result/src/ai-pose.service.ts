import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as tf from '@tensorflow/tfjs-node';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const mkdir = promisify(fs.mkdir);

export interface PoseLandmark {
  name: string;
  x: number;
  y: number;
}

@Injectable()
export class AiPoseService implements OnModuleInit {
  private readonly logger = new Logger(AiPoseService.name);
  private detector: poseDetection.PoseDetector | null = null;
  private readonly tempDir = path.join(process.cwd(), 'temp');

  async onModuleInit() {
    this.logger.log('🤖 Initializing TensorFlow and Pose Detection model...');
    await this.ensureTempDir();
    await this.initDetector();
    this.logger.log('✅ Pose Detection model initialized successfully');
  }

  private async ensureTempDir() {
    if (!fs.existsSync(this.tempDir)) {
      await mkdir(this.tempDir, { recursive: true });
      this.logger.log(`📁 Created temp directory: ${this.tempDir}`);
    }
  }

  private async initDetector() {
    if (this.detector) return this.detector;

    try {
      await tf.ready();
      const model = poseDetection.SupportedModels.MoveNet;
      const detectorConfig = {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        enableSmoothing: true,
      };
      this.detector = await poseDetection.createDetector(model, detectorConfig);
      return this.detector;
    } catch (error) {
      this.logger.error('❌ Failed to initialize pose detector:', error);
      throw error;
    }
  }

  /**
   * Extract pose data from video at all frames (sampled by FPS)
   */
  async extractAllPosesFromVideo(
    videoBuffer: Buffer,
    fps: number = 2,
  ): Promise<{ poses: PoseLandmark[][]; timestamps: number[] }> {
    const videoId = Date.now();
    const videoPath = path.join(this.tempDir, `video-${videoId}.mp4`);

    try {
      // Save video to temp file
      await writeFile(videoPath, videoBuffer);
      this.logger.log(`📹 Video saved: ${videoPath}`);

      // Get video duration first
      const duration = await this.getVideoDuration(videoBuffer);
      this.logger.log(`⏱️ Video duration: ${duration}s`);

      // Generate timestamps based on FPS
      const interval = 1 / fps;
      const timestamps: number[] = [];
      for (let t = 0; t < duration; t += interval) {
        timestamps.push(parseFloat(t.toFixed(2)));
      }

      // Reuse existing extraction logic but we need to call it slightly differently
      // because extractPosesFromVideo expects timestamps and returns just poses.
      // We want to return both poses and the generated timestamps.

      // We can actually reuse extractPosesFromVideo logic here but we need to avoid saving the file twice.
      // Since extractPosesFromVideo saves the file again, let's just use the logic inside it.
      // Actually, better to just call extractPosesFromVideo and pass the generated timestamps.
      // But extractPosesFromVideo takes a buffer, so it will save it again.
      // To avoid double saving, let's refactor slightly or just accept the small overhead for now to keep it clean.

      const poses = await this.extractPosesFromVideo(videoBuffer, timestamps);

      return {
        poses,
        timestamps,
      };
    } catch (error) {
      this.logger.error('❌ Error extracting all poses from video:', error);
      if (fs.existsSync(videoPath)) {
        await unlink(videoPath);
      }
      throw error;
    } finally {
      if (fs.existsSync(videoPath)) {
        await unlink(videoPath);
      }
    }
  }

  /**
   * Extract pose data from video at specific timestamps
   */
  async extractPosesFromVideo(
    videoBuffer: Buffer,
    timestamps: number[],
  ): Promise<PoseLandmark[][]> {
    const videoId = Date.now();
    const videoPath = path.join(this.tempDir, `video-${videoId}.mp4`);

    try {
      // Save video to temp file
      await writeFile(videoPath, videoBuffer);
      this.logger.log(`📹 Video saved: ${videoPath}`);

      // Get video duration first
      const duration = await this.getVideoDuration(videoBuffer);
      this.logger.log(`⏱️ Video duration: ${duration}s`);

      // Validate timestamps
      const invalidTimestamps = timestamps.filter(
        (ts) => ts < 0 || ts > duration,
      );
      if (invalidTimestamps.length > 0) {
        throw new Error(
          `Invalid timestamps: ${invalidTimestamps.join(', ')}. Video duration is ${duration.toFixed(2)}s`,
        );
      }

      const detector = await this.initDetector();
      const allPoses: PoseLandmark[][] = [];

      for (const timestamp of timestamps) {
        this.logger.log(`🎯 Extracting frame at ${timestamp}s...`);
        const framePath = path.join(
          this.tempDir,
          `frame-${videoId}-${timestamp}.jpg`,
        );

        try {
          // Extract frame at timestamp using ffmpeg
          await this.extractFrameAtTimestamp(videoPath, timestamp, framePath);

          // Load image and detect pose
          const imageBuffer = fs.readFileSync(framePath);
          const decodedTensor = tf.node.decodeImage(imageBuffer, 3);

          // Ensure Tensor3D (estimatePoses requires Tensor3D, not Tensor4D)
          let imageTensor: tf.Tensor3D;
          if (decodedTensor.rank === 4) {
            const squeezed = (decodedTensor as tf.Tensor4D).squeeze([0]);
            imageTensor = squeezed as tf.Tensor3D;
            decodedTensor.dispose();
          } else {
            imageTensor = decodedTensor as tf.Tensor3D;
          }

          const poses = await detector.estimatePoses(imageTensor as any);

          if (poses && poses.length > 0 && poses[0].keypoints) {
            const landmarks: PoseLandmark[] = poses[0].keypoints?.map(
              (kp: any) => ({
                name: kp.name,
                x: kp.x / imageTensor.shape[1],
                y: kp.y / imageTensor.shape[0],
              }),
            );
            allPoses.push(landmarks);
            this.logger.log(
              `✅ Detected ${landmarks.length} landmarks at ${timestamp}s`,
            );
          } else {
            this.logger.warn(`⚠️ No pose detected at ${timestamp}s`);
            allPoses.push([]);
          }

          // Cleanup
          imageTensor.dispose();
          if (fs.existsSync(framePath)) {
            await unlink(framePath);
          }
        } catch (error) {
          this.logger.error(
            `❌ Error processing frame at ${timestamp}s:`,
            error,
          );
          allPoses.push([]);
        }
      }

      // Cleanup video file
      if (fs.existsSync(videoPath)) {
        await unlink(videoPath);
      }

      return allPoses;
    } catch (error) {
      this.logger.error('❌ Error extracting poses from video:', error);
      // Cleanup on error
      if (fs.existsSync(videoPath)) {
        await unlink(videoPath);
      }
      throw error;
    }
  }

  /**
   * Extract a single frame from video at specific timestamp
   */
  private async extractFrameAtTimestamp(
    videoPath: string,
    timestamp: number,
    outputPath: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .screenshots({
          timestamps: [timestamp],
          filename: path.basename(outputPath),
          folder: path.dirname(outputPath),
          size: '480x?', // Resize for performance while keeping aspect ratio
        })
        .on('end', () => {
          this.logger.log(`📸 Frame extracted: ${outputPath}`);
          resolve();
        })
        .on('error', (err) => {
          this.logger.error(`❌ FFmpeg error:`, err);
          reject(err);
        });
    });
  }

  /**
   * Get video duration using ffmpeg
   */
  async getVideoDuration(videoBuffer: Buffer): Promise<number> {
    const videoPath = path.join(this.tempDir, `temp-${Date.now()}.mp4`);

    try {
      await writeFile(videoPath, videoBuffer);

      const duration = await new Promise<number>((resolve, reject) => {
        ffmpeg.ffprobe(videoPath, (err, metadata) => {
          if (err) {
            reject(err);
          } else {
            const duration = metadata.format.duration || 0;
            resolve(duration);
          }
        });
      });

      // Cleanup
      if (fs.existsSync(videoPath)) {
        await unlink(videoPath);
      }

      return duration;
    } catch (error) {
      this.logger.error('❌ Error getting video duration:', error);
      if (fs.existsSync(videoPath)) {
        await unlink(videoPath);
      }
      throw error;
    }
  }
}
