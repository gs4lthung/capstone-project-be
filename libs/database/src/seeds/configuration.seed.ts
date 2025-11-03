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
  ]);
};

async function runSeed() {
  await AppDataSource.initialize();
  await configurationSeed(AppDataSource);
  await AppDataSource.destroy();
}

runSeed().catch((error) => {
  console.error('Error seeding configurations:', error);
  process.exit(1);
});
