import { Injectable, Logger } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import * as fs from 'fs';
import { spawn } from 'child_process';
@Injectable()
export class FfmpegService {
  private logger = new Logger(FfmpegService.name);

  async splitVideoToSegments(filePath: string, segments: number = 10) {
    if (!fs.existsSync(filePath)) {
      this.logger.error(`File not found: ${filePath}`);
      throw new Error(`File not found: ${filePath}`);
    }

    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          this.logger.error(`Failed to get video metadata: ${err.message}`);
          return reject(err);
        }

        const duration = metadata.format.duration;
        const segmentDuration = duration / segments;

        const segmentPromises = [];

        for (let i = 0; i < segments; i++) {
          const start = i * segmentDuration;
          const outputFilePath = filePath.replace(
            path.extname(filePath),
            `_part${i + 1}${path.extname(filePath)}`,
          );

          segmentPromises.push(
            new Promise((resolve, reject) => {
              ffmpeg(filePath)
                .setStartTime(start)
                .setDuration(segmentDuration)
                .output(outputFilePath)
                .on('end', () => {
                  resolve(outputFilePath);
                })
                .on('error', (err) => {
                  this.logger.error(
                    `Error processing segment ${i + 1}: ${err.message}`,
                  );
                  reject(err);
                })
                .run();
            }),
          );
        }

        Promise.all(segmentPromises)
          .then((outputFiles) => resolve(outputFiles))
          .catch((err) => reject(err));
      });
    });
  }

  async convertVideoToTsSegments(filePath: string) {
    if (!fs.existsSync(filePath)) {
      this.logger.error(`File not found: ${filePath}`);
      throw new Error(`File not found: ${filePath}`);
    }

    return new Promise((resolve, reject) => {
      const destination = path.dirname(filePath);
      const baseName = path.parse(filePath).name;
      const tsFilePattern = path.join(destination, `${baseName}_%03d.ts`);

      ffmpeg(filePath)
        .outputOptions(
          '-c:v',
          'copy',
          '-map',
          '0',
          '-segment_time',
          '10',
          '-f',
          'segment',
          '-reset_timestamps',
          '1',
        )
        .output(tsFilePattern)
        .on('end', () => {
          resolve(tsFilePattern);
        })
        .on('error', (err) => {
          this.logger.error(`Error converting to TS segments: ${err.message}`);
          reject(err);
        })
        .run();
    });
  }

  async createVideoThumbnail(filePath: string, outputDes: string) {
    if (!fs.existsSync(filePath)) {
      this.logger.error(`File not found: ${filePath}`);
      return new Error(`File not found: ${filePath}`);
    }

    // Restrict outputDes to uploads root
    const UPLOADS_ROOT = process.env.UPLOADS_ROOT
      ? path.resolve(process.env.UPLOADS_ROOT)
      : path.resolve(process.cwd(), 'uploads');
    const safeOutputDes = path.resolve(
      UPLOADS_ROOT,
      path.relative(UPLOADS_ROOT, outputDes),
    );
    if (!safeOutputDes.startsWith(UPLOADS_ROOT)) {
      this.logger.error(`Invalid output destination: ${outputDes}`);
      throw new Error('Invalid output destination');
    }
    if (!fs.existsSync(safeOutputDes)) {
      fs.mkdirSync(safeOutputDes, { recursive: true });
    }

    const outputFileName = `${path.basename(filePath, '.mp4')}-thumbnail.png`;
    const outputPath = path.join(safeOutputDes, outputFileName);

    await new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
        '-analyzeduration',
        '100M',
        '-probesize',
        '100M',
        '-ss',
        '00:00:01',
        '-i',
        filePath,
        '-vf',
        'thumbnail',
        '-frames:v',
        '1',
        '-update',
        '1',
        outputPath,
      ]);

      // ffmpeg.stderr.on('data', (data) => {
      //   this.logger.error(`FFmpeg error: ${data}`);
      // });

      ffmpeg.stdout.on('data', (data) => {
        this.logger.log(`FFmpeg output: ${data}`);
      });

      ffmpeg.on('close', (code) => {
        if (code === 0) resolve(outputPath);
        else reject(new Error(`FFmpeg process exited with code ${code}`));
      });

      ffmpeg.on('error', (err) => {
        reject(new Error(`FFmpeg process error: ${err.message}`));
      });
    });

    return outputPath;
  }

  async createVideoThumbnailVer2(
    filePath: string,
    outputDes: string,
    timestamp: string = '00:00:01',
  ): Promise<string> {
    const thumnailPath = path.join(
      outputDes,
      `${path.basename(filePath, path.extname(filePath))}-thumbnail.png`,
    );

    return new Promise<string>((resolve, reject) => {
      ffmpeg(filePath)
        .screenshots({
          timestamps: [timestamp],
          filename: path.basename(thumnailPath),
          folder: outputDes,
          size: '320x240',
        })
        .on('end', () => {
          this.logger.log(`Thumbnail created at ${thumnailPath}`);
          resolve(thumnailPath);
        })
        .on('error', (err) => {
          this.logger.error(`Error creating thumbnail: ${err.message}`);
          reject(err);
        });
    });
  }

  async getVideoFileDuration(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const ffprobe = spawn('ffprobe', [
        '-v',
        'error',
        '-show_entries',
        'format=duration',
        '-of',
        'default=noprint_wrappers=1:nokey=1',
        filePath,
      ]);

      let output = '';

      ffprobe.stdout.on('data', (data) => {
        output += data.toString();
      });

      ffprobe.on('close', (code) => {
        if (code === 0) {
          const duration = parseInt(output.trim());
          if (!isNaN(duration)) {
            resolve(Math.round(duration));
          } else {
            reject(new Error(`Failed to parse duration from: ${output}`));
          }
        } else {
          reject(new Error(`FFprobe exited with code ${code} for ${filePath}`));
        }
      });

      ffprobe.on('error', (error) => {
        reject(new Error(`FFprobe error: ${error.message}`));
      });
    });
  }

  async findClosetTsFileOfVideoLengthPercentage(
    folderPath: string,
    targetPercentage: number = 10,
  ) {
    const files = fs
      .readdirSync(folderPath)
      .filter((file) => file.endsWith('.ts'));

    let totalDurations = 0;
    const fileDurations = [];

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const duration = await this.getVideoFileDuration(filePath);
      fileDurations.push({ file: file, duration: duration });
      totalDurations += duration;
    }

    const targetDuration = (totalDurations * targetPercentage) / 100;
    let cumulativeDuration = 0;
    let selectedFile = null;

    for (const { file, duration } of fileDurations) {
      cumulativeDuration += duration;

      if (cumulativeDuration >= targetDuration) {
        selectedFile = { file, duration };
        break;
      }
    }

    return {
      file: selectedFile.file,
      duration: Math.round(selectedFile.duration),
    };
  }

  async convertTsSegmentsToM3u8File(folderPath: string) {
    return new Promise((resolve, reject) => {
      folderPath = path.resolve(folderPath);

      const m3u8FilePath = path.join(folderPath, 'output.m3u8');

      const tsFiles = fs
        .readdirSync(folderPath)
        .filter((file) => file.endsWith('.ts'))
        .sort();

      if (tsFiles.length === 0)
        return reject(new Error('No .ts files found in the specified folder'));

      let m3u8Content = `#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:10\n`;

      tsFiles.forEach((file) => {
        m3u8Content += `#EXTINF:10.000,\n${file}\n`;
      });

      m3u8Content += `#EXT-X-ENDLIST\n`;

      fs.writeFileSync(m3u8FilePath, m3u8Content, { encoding: 'utf-8' });

      resolve(m3u8FilePath);
    });
  }

  private getVideoMetadata = (filePath: string) =>
    new Promise<{ width: number; height: number }>((resolve, reject) => {
      const ffprobe = spawn('ffprobe', [
        '-v',
        'error',
        '-select_streams',
        'v:0',
        '-show_entries',
        'stream=width,height',
        '-of',
        'json',
        filePath,
      ]);

      let output = '';

      ffprobe.stdout.on('data', (data) => {
        output += data.toString();
      });

      ffprobe.on('close', (code) => {
        if (code === 0) {
          try {
            const parsed = JSON.parse(output);
            const stream = parsed.streams[0];
            resolve({ width: stream.width, height: stream.height });
          } catch (err) {
            reject(new Error(`Failed to parse video metadata: ${err.message}`));
          }
        } else {
          reject(new Error(`FFprobe exited with code ${code}`));
        }
      });

      ffprobe.on('error', (err) => {
        reject(err);
      });
    });

  getVideoMetadataProbe(url: string): Promise<ffmpeg.FfprobeData> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(url, (err, metadata) => {
        if (err) reject(err);
        else resolve(metadata);
      });
    });
  }

  async extractFrames(
    videoPath: string,
    outputDir: string = 'uploads/videos',
    fps = 60,
  ) {
    return new Promise<void>((resolve, reject) => {
      ffmpeg(videoPath)
        .outputOptions([
          '-vf',
          `fps=${fps}`, // Set frame extraction rate
          '-qscale:v',
          '2', // Output quality (lower is better)
        ])
        .output(`${outputDir}/frame-%04d.jpg`)
        .on('end', () => {
          console.log('Frames extracted successfully');
          resolve();
        })
        .on('error', (err) => {
          console.error('Error extracting frames:', err);
          reject(err);
        })
        .run();
    });
  }
}
