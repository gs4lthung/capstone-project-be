import { DataSource } from 'typeorm';
import { Configuration } from '../entities/configuration.entity';
import { AppDataSource } from '../data-source';

export const configurationSeed = async (dataSource: DataSource) => {
  const configurationRepository = dataSource.getRepository(Configuration);

  await configurationRepository.save([
    {
      key: 'platform_fee_per_percentage',
      value: '10',
      description: 'Platform fee of course earning total',
      dataType: 'number',
    },
    {
      key: 'course_start_before_days',
      value: '1',
      description:
        'Number of days before course start date to automatically start the course',
      dataType: 'number',
    },
    {
      key: 'complete_session_before_hours',
      value: '24',
      description:
        'Number of hours before session end time to allow marking session as complete',
      dataType: 'number',
    },
    {
      key: 'course_start_date_after_days_from_now',
      value: '7',
      description:
        'Number of days from now that a course can be scheduled to start',
      dataType: 'number',
    },
  ]);
};

// async function runSeed() {
//   await AppDataSource.initialize();
//   await configurationSeed(AppDataSource);
//   await AppDataSource.destroy();
// }

// runSeed().catch((error) => {
//   console.error('Error seeding configurations:', error);
//   process.exit(1);
// });
