import { DataSource } from 'typeorm';
import { seedUsers } from './users.seed';
import { seedElections } from './elections.seed';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'voting_user',
  password: process.env.DATABASE_PASSWORD || 'voting_secure_pass_2025',
  database: process.env.DATABASE_NAME || 'voting_db',
  entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
  synchronize: false,
});

async function runSeeds() {
  try {
    console.log('🔌 Connecting to database...');
    await AppDataSource.initialize();
    console.log('✅ Database connected!');

    console.log('\n🌱 Running seeds...\n');

    await seedUsers(AppDataSource);
    await seedElections(AppDataSource);

    console.log('\n✅ All seeds completed successfully!');

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running seeds:', error);
    process.exit(1);
  }
}

runSeeds();

