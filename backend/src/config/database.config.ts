import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER || 'voting_user',
    password: process.env.DATABASE_PASSWORD || 'voting_secure_pass_2025',
    database: process.env.DATABASE_NAME || 'voting_db',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true, // TEMPORAL: Habilitar para crear tablas en producción. Cambiar a false después de primer deploy
    logging: process.env.NODE_ENV === 'development',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  }),
);

