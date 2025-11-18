import { DataSource } from 'typeorm';
import { Subject } from '../entities/subject.entity';
import { Lesson } from '../entities/lesson.entity';
import { User } from '../entities/user.entity';
import { UserRole } from '@app/shared/enums/user.enum';
import { PickleballLevel } from '@app/shared/enums/pickleball.enum';
import { SubjectStatus } from '@app/shared/enums/subject.enum';
import { Quiz } from '../entities/quiz.entity';
import { Video } from '../entities/video.entity';
import { Question } from '../entities/question.entity';
import { QuestionOption } from '../entities/question-option.entity';
import { AppDataSource } from '../data-source';
import { CoachVideoStatus } from '@app/shared/enums/coach.enum';

export const subjectAndLessonSeed = async (datasource: DataSource) => {
  const subjectRepository = datasource.getRepository(Subject);
  const lessonRepository = datasource.getRepository(Lesson);
  const quizRepository = datasource.getRepository(Quiz);
  const questionRepository = datasource.getRepository(Question);
  const questionOptionsRepository = datasource.getRepository(QuestionOption);
  const videoRepository = datasource.getRepository(Video);
  const userRepository = datasource.getRepository(User);

  const coach = await userRepository.findOne({
    where: {
      role: {
        name: UserRole.COACH,
      },
    },
  });
  if (!coach) {
    throw new Error('No coach found. Please seed users first.');
  }

  const subjects = subjectRepository.create([
    {
      name: 'Nhập môn Pickleball',
      description:
        'Khám phá thế giới Pickleball từ những bước đầu tiên. Khóa học này sẽ giúp bạn hiểu rõ về luật chơi, kỹ thuật cơ bản và cách tham gia vào cộng đồng Pickleball sôi động.',
      level: PickleballLevel.BEGINNER,
      createdBy: coach,
      status: SubjectStatus.PUBLISHED,
      lessons: lessonRepository.create([
        {
          name: 'Giới thiệu về Pickleball',
          description:
            'TÌm hiểu về các động tác cơ bản và cách chơi Pickleball.',
          lessonNumber: 1,
          duration: 120,
          quizzes: quizRepository.create([
            {
              title: 'Câu hỏi về giới thiệu Pickleball',
              description: 'Đánh giá kiến thức cơ bản về Pickleball.',
              totalQuestions: 5,
              createdBy: coach,
              questions: questionRepository.create([
                {
                  title: 'Pickleball phù hợp vói những ai?',
                  explanation:
                    ' Pickleball là môn thể thao dành cho mọi lứa tuổi và trình độ kỹ năng.',
                  options: questionOptionsRepository.create([
                    {
                      content: 'Chỉ dành cho trẻ em',
                      isCorrect: false,
                    },
                    {
                      content: 'Mọi lứa tuổi',
                      isCorrect: true,
                    },
                    {
                      content: 'Chỉ dành cho người lớn',
                      isCorrect: false,
                    },
                    {
                      content: 'Chỉ dành cho vận động viên chuyên nghiệp',
                      isCorrect: false,
                    },
                  ]),
                },
                {
                  title: 'Dụng cụ cơ bản để chơi Pickleball là gì?',
                  explanation: 'Dụng cụ cơ bản bao gồm vợt, bóng và lưới.',
                  options: questionOptionsRepository.create([
                    {
                      content: 'Vợt và bóng',
                      isCorrect: false,
                    },
                    {
                      content: 'Bóng và lưới',
                      isCorrect: false,
                    },
                    {
                      content: 'Vợt, bóng và lưới',
                      isCorrect: true,
                    },
                    {
                      content: 'Chỉ vợt',
                      isCorrect: false,
                    },
                  ]),
                },
                {
                  title: 'Mục tiêu chính của trò chơi Pickleball là gì?',
                  explanation:
                    'Mục tiêu chính là ghi điểm bằng cách đánh bóng qua lưới và vào khu vực đối phương mà họ không thể trả lại.',
                  options: questionOptionsRepository.create([
                    {
                      content: 'Giữ bóng trong sân của mình càng lâu càng tốt',
                      isCorrect: false,
                    },
                    {
                      content: 'Ghi điểm bằng cách đánh bóng qua lưới',
                      isCorrect: true,
                    },
                    {
                      content: 'Đánh bóng ra ngoài sân đối phương',
                      isCorrect: false,
                    },
                    {
                      content: 'Chạm bóng vào lưới',
                      isCorrect: false,
                    },
                  ]),
                },
                {
                  title: 'Kích thước sân Pickleball tiêu chuẩn là bao nhiêu?',
                  explanation:
                    'Sân Pickleball tiêu chuẩn có kích thước 20 feet rộng và 44 feet dài.',
                  options: questionOptionsRepository.create([
                    {
                      content: '10 feet rộng và 22 feet dài',
                      isCorrect: false,
                    },
                    {
                      content: '20 feet rộng và 44 feet dài',
                      isCorrect: true,
                    },
                    {
                      content: '30 feet rộng và 60 feet dài',
                      isCorrect: false,
                    },
                    {
                      content: '40 feet rộng và 80 feet dài',
                      isCorrect: false,
                    },
                  ]),
                },
                {
                  title: 'Lưới Pickleball được đặt ở độ cao nào?',
                  explanation:
                    'Lưới Pickleball được đặt ở độ cao 36 inch ở hai bên và 34 inch ở giữa.',
                  options: questionOptionsRepository.create([
                    {
                      content: '30 inch ở hai bên và 28 inch ở giữa',
                      isCorrect: false,
                    },
                    {
                      content: '36 inch ở hai bên và 34 inch ở giữa',
                      isCorrect: true,
                    },
                    {
                      content: '40 inch ở hai bên và 38 inch ở giữa',
                      isCorrect: false,
                    },
                    {
                      content: '42 inch ở hai bên và 40 inch ở giữa',
                      isCorrect: false,
                    },
                  ]),
                },
              ]),
            },
          ]),
          videos: videoRepository.create([
            {
              title: 'Video giới thiệu về Pickleball',
              description:
                'Video này cung cấp cái nhìn tổng quan về môn thể thao Pickleball, bao gồm lịch sử, luật chơi và những lợi ích khi tham gia.',
              tags: ['pickleball', 'giới thiệu', 'thể thao'],
              drillName: 'Tập luyện cơ bản',
              drillDescription: 'Các bài tập cơ bản để làm quen với Pickleball',
              drillPracticeSets: '3 set, mỗi set 10 phút',
              publicUrl: 'https://example.com/videos/intro-to-pickleball.mp4',
              duration: 600,
              uploadedBy: coach,
              status: CoachVideoStatus.READY,
            },
          ]),
        },
        {
          name: 'Forehand trong Pickleball',
          description: 'Tìm hiểu về động tác Forehand trong Pickleball.',
          lessonNumber: 2,
          duration: 150,
          videos: videoRepository.create([
            {
              title: 'Kỹ thuật đánh forehand',
              description:
                'Hướng dẫn chi tiết về kỹ thuật đánh forehand trong Pickleball, bao gồm cách cầm vợt, tư thế và chuyển động cơ thể.',
              tags: ['pickleball', 'forehand', 'kỹ thuật'],
              drillName: 'Tập luyện forehand',
              drillDescription:
                'Các bài tập để cải thiện kỹ thuật đánh forehand',
              drillPracticeSets: '4 set, mỗi set 8 phút',
              publicUrl: 'https://example.com/videos/forehand-technique.mp4',
              duration: 800,
              uploadedBy: coach,
              status: CoachVideoStatus.READY,
            },
          ]),
          quizzes: quizRepository.create([
            {
              title: 'Câu hỏi về forehand',
              description:
                'Đánh giá kiến thức về kỹ thuật forehand trong Pickleball.',
              totalQuestions: 3,
              createdBy: coach,
              questions: questionRepository.create([
                {
                  title: 'Tay nào thường được sử dụng để đánh forehand?',
                  explanation:
                    'Forehand thường được đánh bằng tay thuận của người chơi.',
                  options: questionOptionsRepository.create([
                    {
                      content: 'Tay trái',
                      isCorrect: false,
                    },
                    {
                      content: 'Tay thuận',
                      isCorrect: true,
                    },
                    {
                      content: 'Cả hai tay',
                      isCorrect: false,
                    },
                    {
                      content: 'Tay không thuận',
                      isCorrect: false,
                    },
                  ]),
                },
              ]),
            },
            {
              title: 'Câu hỏi về kỹ thuật đánh forehand',
              description:
                'Kiểm tra hiểu biết của bạn về các kỹ thuật cơ bản của forehand trong Pickleball.',
              totalQuestions: 2,
              createdBy: coach,
              questions: questionRepository.create([
                {
                  title:
                    'Điều gì là quan trọng nhất khi thực hiện cú đánh forehand?',
                  explanation:
                    'Tư thế cơ thể và vị trí chân đóng vai trò quan trọng trong việc thực hiện cú đánh forehand hiệu quả.',
                  options: questionOptionsRepository.create([
                    {
                      content: 'Tư thế cơ thể và vị trí chân',
                      isCorrect: true,
                    },
                    {
                      content: 'Chỉ cần vung vợt mạnh',
                      isCorrect: false,
                    },
                    {
                      content: 'Chỉ cần cầm vợt chắc chắn',
                      isCorrect: false,
                    },
                    {
                      content: 'Không cần chú ý đến tư thế',
                      isCorrect: false,
                    },
                  ]),
                },
              ]),
            },
            {
              title: 'Câu hỏi nâng cao về forehand',
              description:
                'Đánh giá kiến thức nâng cao về kỹ thuật forehand trong Pickleball.',
              totalQuestions: 2,
              createdBy: coach,
              questions: questionRepository.create([
                {
                  title: 'Làm thế nào để tăng độ chính xác khi đánh forehand?',
                  explanation:
                    'Tăng độ chính xác khi đánh forehand có thể đạt được thông qua việc luyện tập đều đặn và tập trung vào kỹ thuật.',
                  options: questionOptionsRepository.create([
                    {
                      content: 'Luyện tập đều đặn và tập trung vào kỹ thuật',
                      isCorrect: true,
                    },
                    {
                      content: 'Chỉ cần đánh mạnh hơn',
                      isCorrect: false,
                    },
                    {
                      content: 'Không cần luyện tập nhiều',
                      isCorrect: false,
                    },
                    {
                      content: 'Chỉ cần thay đổi vợt',
                      isCorrect: false,
                    },
                  ]),
                },
              ]),
            },
          ]),
        },
        {
          name: 'Backhand trong Pickleball',
          description: 'Tìm hiểu về động tác Backhand trong Pickleball.',
          lessonNumber: 3,
          duration: 150,
          videos: videoRepository.create([
            {
              title: 'Kỹ thuật đánh backhand',
              description:
                'Hướng dẫn chi tiết về kỹ thuật đánh backhand trong Pickleball, bao gồm cách cầm vợt, tư thế và chuyển động cơ thể.',
              tags: ['pickleball', 'backhand', 'kỹ thuật'],
              drillName: 'Tập luyện backhand',
              drillDescription:
                'Các bài tập để cải thiện kỹ thuật đánh backhand',
              drillPracticeSets: '4 set, mỗi set 8 phút',
              publicUrl: 'https://example.com/videos/backhand-technique.mp4',
              duration: 800,
              uploadedBy: coach,
              status: CoachVideoStatus.READY,
            },
          ]),
          quizzes: quizRepository.create([
            {
              title: 'Câu hỏi về backhand',
              description:
                'Đánh giá kiến thức về kỹ thuật backhand trong Pickleball.',
              totalQuestions: 3,
              createdBy: coach,
              questions: questionRepository.create([
                {
                  title: 'Tay nào thường được sử dụng để đánh backhand?',
                  explanation:
                    'Backhand thường được đánh bằng tay không thuận của người chơi.',
                  options: questionOptionsRepository.create([
                    {
                      content: 'Tay thuận',
                      isCorrect: false,
                    },
                    {
                      content: 'Tay không thuận',
                      isCorrect: true,
                    },
                    {
                      content: 'Cả hai tay',
                      isCorrect: false,
                    },
                    {
                      content: 'Tay trái',
                      isCorrect: false,
                    },
                  ]),
                },
                {
                  title: 'Khi nào nên sử dụng cú đánh backhand trong trận đấu?',
                  explanation:
                    'Cú đánh backhand thường được sử dụng khi bóng đến phía không thuận của người chơi hoặc khi cần thay đổi hướng đánh.',
                  options: questionOptionsRepository.create([
                    {
                      content: 'Khi bóng đến phía thuận của người chơi',
                      isCorrect: false,
                    },
                    {
                      content: 'Khi bóng đến phía không thuận của người chơi',
                      isCorrect: true,
                    },
                    {
                      content: 'Khi không muốn thay đổi hướng đánh',
                      isCorrect: false,
                    },
                    {
                      content: 'Khi đứng gần lưới',
                      isCorrect: false,
                    },
                  ]),
                },
                {
                  title:
                    'Điều gì là quan trọng nhất khi thực hiện cú đánh backhand?',
                  explanation:
                    'Tư thế cơ thể và vị trí chân đóng vai trò quan trọng trong việc thực hiện cú đánh backhand hiệu quả.',
                  options: questionOptionsRepository.create([
                    {
                      content: 'Tư thế cơ thể và vị trí chân',
                      isCorrect: true,
                    },
                    {
                      content: 'Chỉ cần vung vợt mạnh',
                      isCorrect: false,
                    },
                    {
                      content: 'Chỉ cần cầm vợt chắc chắn',
                      isCorrect: false,
                    },
                    {
                      content: 'Không cần chú ý đến tư thế',
                      isCorrect: false,
                    },
                  ]),
                },
              ]),
            },
          ]),
        },
        {
          name: 'Giao bóng trong Pickleball',
          description: 'Tìm hiểu về kỹ thuật giao bóng trong Pickleball.',
          lessonNumber: 4,
          duration: 150,
          videos: videoRepository.create([
            {
              title: 'Kỹ thuật giao bóng',
              description:
                'Hướng dẫn chi tiết về kỹ thuật giao bóng trong Pickleball, bao gồm cách cầm vợt, tư thế và chuyển động cơ thể.',
              tags: ['pickleball', 'giao bóng', 'kỹ thuật'],
              drillName: 'Tập luyện giao bóng',
              drillDescription: 'Các bài tập để cải thiện kỹ thuật giao bóng',
              drillPracticeSets: '4 set, mỗi set 8 phút',
              publicUrl: 'https://example.com/videos/serve-technique.mp4',
              duration: 800,
              uploadedBy: coach,
              status: CoachVideoStatus.READY,
            },
          ]),
          quizzes: quizRepository.create([
            {
              title: 'Câu hỏi về giao bóng',
              description:
                'Các câu hỏi kiểm tra kiến thức về kỹ thuật giao bóng trong Pickleball.',
              totalQuestions: 3,
              createdBy: coach,
              questions: questionRepository.create([
                {
                  title: 'Khi nào nên sử dụng cú giao bóng trong trận đấu?',
                  explanation:
                    'Cú giao bóng được sử dụng để bắt đầu mỗi điểm trong trận đấu Pickleball.',
                  options: questionOptionsRepository.create([
                    {
                      content: 'Khi bóng đến phía thuận của người chơi',
                      isCorrect: false,
                    },
                    {
                      content: 'Để bắt đầu mỗi điểm',
                      isCorrect: true,
                    },
                    {
                      content: 'Khi không muốn thay đổi hướng đánh',
                      isCorrect: false,
                    },
                    {
                      content: 'Khi đứng gần lưới',
                      isCorrect: false,
                    },
                  ]),
                },
                {
                  title:
                    'Điều gì là quan trọng nhất khi thực hiện cú giao bóng?',
                  explanation:
                    'Tư thế cơ thể và vị trí chân đóng vai trò quan trọng trong việc thực hiện cú giao bóng hiệu quả.',
                  options: questionOptionsRepository.create([
                    {
                      content: 'Tư thế cơ thể và vị trí chân',
                      isCorrect: true,
                    },
                    {
                      content: 'Chỉ cần vung vợt mạnh',
                      isCorrect: false,
                    },
                    {
                      content: 'Chỉ cần cầm vợt chắc chắn',
                      isCorrect: false,
                    },
                    {
                      content: 'Không cần chú ý đến tư thế',
                      isCorrect: false,
                    },
                  ]),
                },
                {
                  title: 'Làm thế nào để tăng độ chính xác khi giao bóng?',
                  explanation:
                    'Tăng độ chính xác khi giao bóng có thể đạt được thông qua việc luyện tập đều đặn và tập trung vào kỹ thuật.',
                  options: questionOptionsRepository.create([
                    {
                      content: 'Luyện tập đều đặn và tập trung vào kỹ thuật',
                      isCorrect: true,
                    },
                    {
                      content: 'Chỉ cần đánh mạnh hơn',
                      isCorrect: false,
                    },
                    {
                      content: 'Không cần luyện tập nhiều',
                      isCorrect: false,
                    },
                    {
                      content: 'Chỉ cần thay đổi vợt',
                      isCorrect: false,
                    },
                  ]),
                },
              ]),
            },
          ]),
        },
      ]),
    },
  ]);
  await subjectRepository.save(subjects);
};

async function runSeed() {
  await AppDataSource.initialize();
  await subjectAndLessonSeed(AppDataSource);
  await AppDataSource.destroy();
}

runSeed().catch((error) => {
  console.error('Error running seed:', error);
  process.exit(1);
});
