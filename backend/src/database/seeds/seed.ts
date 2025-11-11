import { DataSource } from 'typeorm';
import { seedUsers } from './users.seed';
import * as dotenv from 'dotenv';

dotenv.config();

async function runSeeds() {
  console.log('🚀 Starting database seeding...\n');

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER || 'voting_user',
    password: process.env.DATABASE_PASSWORD || 'voting_secure_pass_2025',
    database: process.env.DATABASE_NAME || 'voting_db',
    entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
    synchronize: true,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connection established\n');

    // Run seeds
    await seedUsers(dataSource);

    console.log('\n✨ All seeds completed successfully!');
    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

runSeeds();

