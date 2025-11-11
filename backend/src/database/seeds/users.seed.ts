import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../modules/users/entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';

export async function seedUsers(dataSource: DataSource): Promise<void> {
  const userRepository = dataSource.getRepository(User);

  // Verificar si ya existen usuarios
  const existingUsers = await userRepository.count();
  if (existingUsers > 0) {
    console.log('✅ Users already seeded, skipping...');
    return;
  }

  console.log('🌱 Seeding users...');

  const bcryptRounds = 12;

  // Usuario normal de prueba
  const normalUser = userRepository.create({
    email: 'user@test.com',
    identificationNumber: '1234567890',
    password: await bcrypt.hash('password123', bcryptRounds),
    fullName: 'Usuario de Prueba',
    role: UserRole.VOTER,
    isActive: true,
    isVerified: true,
    mfaEnabled: false,
  });

  // Usuario administrador de prueba
  const adminUser = userRepository.create({
    email: 'admin@test.com',
    identificationNumber: 'admin',
    password: await bcrypt.hash('admin123', bcryptRounds),
    fullName: 'Administrador del Sistema',
    role: UserRole.ADMIN,
    isActive: true,
    isVerified: true,
    mfaEnabled: false,
  });

  // Super Admin
  const superAdminUser = userRepository.create({
    email: 'superadmin@test.com',
    identificationNumber: 'superadmin',
    password: await bcrypt.hash('superadmin123', bcryptRounds),
    fullName: 'Super Administrador',
    role: UserRole.SUPER_ADMIN,
    isActive: true,
    isVerified: true,
    mfaEnabled: false,
  });

  // Auditor
  const auditorUser = userRepository.create({
    email: 'auditor@test.com',
    identificationNumber: '9876543210',
    password: await bcrypt.hash('auditor123', bcryptRounds),
    fullName: 'Auditor del Sistema',
    role: UserRole.AUDITOR,
    isActive: true,
    isVerified: true,
    mfaEnabled: false,
  });

  await userRepository.save([normalUser, adminUser, superAdminUser, auditorUser]);

  console.log('✅ Users seeded successfully!');
  console.log('\n📋 Test Credentials:');
  console.log('==========================================');
  console.log('👤 Normal User:');
  console.log('   ID: 1234567890');
  console.log('   Email: user@test.com');
  console.log('   Password: password123');
  console.log('\n👨‍💼 Admin:');
  console.log('   ID: admin');
  console.log('   Email: admin@test.com');
  console.log('   Password: admin123');
  console.log('\n🔐 Super Admin:');
  console.log('   ID: superadmin');
  console.log('   Email: superadmin@test.com');
  console.log('   Password: superadmin123');
  console.log('\n🔍 Auditor:');
  console.log('   ID: 9876543210');
  console.log('   Email: auditor@test.com');
  console.log('   Password: auditor123');
  console.log('==========================================\n');
}

