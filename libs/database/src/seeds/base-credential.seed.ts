import { DataSource } from 'typeorm';
import { BaseCredential } from '../entities/base-credential.entity';
import { CourseCredentialType } from '@app/shared/enums/course.enum';
import { AppDataSource } from '../data-source';

export const baseCredentialSeed = async (dataSource: DataSource) => {
  const baseCredentialRepository = dataSource.getRepository(BaseCredential);

  await baseCredentialRepository.save([
    {
      name: 'Huấn luyện viên được chứng nhận PPR Cấp 1',
      description:
        'Hoàn thành chứng chỉ huấn luyện pickleball Cấp 1 được công nhận, tập trung cho người mới bắt đầu và người ở mức cải thiện.',
      type: CourseCredentialType.CERTIFICATE,
      publicUrl: 'https://example.com/credentials/ppr-level-1',
    },
    {
      name: 'Giảng viên IPTPA Cấp 2',
      description:
        'Chứng chỉ huấn luyện nâng cao về kỹ thuật, chiến thuật và phát triển vận động viên cho trình độ trung cấp đến nâng cao.',
      type: CourseCredentialType.CERTIFICATE,
      publicUrl: 'https://example.com/credentials/iptpa-level-2',
    },
    {
      name: 'Vô địch Đôi nam nữ Khu vực 2024',
      description:
        'Đoạt hạng nhất tại giải đấu đôi nam nữ cấp khu vực có chứng nhận.',
      type: CourseCredentialType.PRIZE,
      publicUrl: 'https://example.com/credentials/regional-mixed-2024',
    },
    {
      name: 'Quán quân Bảng xếp hạng Đơn Câu lạc bộ',
      description:
        'Kết thúc mùa giải với vị trí số 1 trên bảng xếp hạng đơn của câu lạc bộ.',
      type: CourseCredentialType.ACHIEVEMENT,
      publicUrl: 'https://example.com/credentials/club-singles-ladder',
    },
    {
      name: 'Xếp hạng DUPR 4.5',
      description:
        'Đạt xếp hạng DUPR chính thức 4.5 thông qua các trận đấu đã được xác minh.',
      type: CourseCredentialType.ACHIEVEMENT,
      publicUrl: 'https://example.com/credentials/dupr-4-5',
    },
    {
      name: 'Hoàn thành SafeSport & Sơ cứu',
      description:
        'Hoàn tất các khóa về an toàn vận động viên, SafeSport và sơ cứu cơ bản trong môi trường huấn luyện.',
      type: CourseCredentialType.CERTIFICATE,
      publicUrl: 'https://example.com/credentials/safesport-first-aid',
    },
    {
      name: 'Huấn luyện viên chính Chương trình Phát triển Thanh thiếu niên',
      description:
        'Đảm nhiệm vai trò huấn luyện viên chính cho một chương trình phát triển pickleball dành cho thanh thiếu niên trong ít nhất một mùa.',
      type: CourseCredentialType.ACHIEVEMENT,
      publicUrl: 'https://example.com/credentials/youth-program-coach',
    },
    {
      name: 'Á quân Đôi nam Cúp Bang',
      description:
        'Vào tới trận chung kết nội dung đôi nam của giải mở cấp bang.',
      type: CourseCredentialType.PRIZE,
      publicUrl: 'https://example.com/credentials/state-open-finalist',
    },
  ]);
};

async function runSeed() {
  await AppDataSource.initialize();
  await baseCredentialSeed(AppDataSource);
  await AppDataSource.destroy();
}

runSeed().catch((error) => {
  console.error('Error seeding configurations:', error);
  process.exit(1);
});
