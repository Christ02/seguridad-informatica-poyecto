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

  console.log('🌱 Seeding users for Guatemala...');

  const bcryptRounds = 12;

  // Usuario normal de prueba (Votante)
  const normalUser = userRepository.create({
    email: 'user@test.com',
    dpi: '2958674130101', // DPI válido de Guatemala (13 dígitos)
    firstName: 'María',
    lastName: 'González López',
    dateOfBirth: new Date('1995-05-15'),
    phoneNumber: '45678901', // Teléfono de Guatemala (8 dígitos)
    department: 'Guatemala',
    municipality: 'Guatemala',
    password: await bcrypt.hash('password123', bcryptRounds),
    role: UserRole.VOTER,
    isActive: true,
    isVerified: true,
    mfaEnabled: false,
  });

  // Usuario administrador de prueba
  const adminUser = userRepository.create({
    email: 'admin@test.com',
    dpi: '1234567890101', // DPI de admin
    firstName: 'Carlos',
    lastName: 'Ramírez Mendoza',
    dateOfBirth: new Date('1985-03-20'),
    phoneNumber: '23456789',
    department: 'Guatemala',
    municipality: 'Mixco',
    password: await bcrypt.hash('admin123', bcryptRounds),
    role: UserRole.ADMIN,
    isActive: true,
    isVerified: true,
    mfaEnabled: false,
  });

  // Super Admin
  const superAdminUser = userRepository.create({
    email: 'superadmin@test.com',
    dpi: '9876543210101', // DPI de super admin
    firstName: 'Ana',
    lastName: 'Martínez Pérez',
    dateOfBirth: new Date('1980-08-10'),
    phoneNumber: '34567890',
    department: 'Guatemala',
    municipality: 'Villa Nueva',
    password: await bcrypt.hash('superadmin123', bcryptRounds),
    role: UserRole.SUPER_ADMIN,
    isActive: true,
    isVerified: true,
    mfaEnabled: false,
  });

  // Auditor
  const auditorUser = userRepository.create({
    email: 'auditor@test.com',
    dpi: '5432167890101', // DPI de auditor
    firstName: 'José',
    lastName: 'Hernández García',
    dateOfBirth: new Date('1990-12-05'),
    phoneNumber: '56789012',
    department: 'Sacatepéquez',
    municipality: 'Antigua Guatemala',
    password: await bcrypt.hash('auditor123', bcryptRounds),
    role: UserRole.AUDITOR,
    isActive: true,
    isVerified: true,
    mfaEnabled: false,
  });

  await userRepository.save([normalUser, adminUser, superAdminUser, auditorUser]);

  console.log('✅ Users seeded successfully!');
  console.log('\n📋 Credenciales de Prueba (Guatemala):');
  console.log('==========================================');
  console.log('👤 Votante Normal:');
  console.log('   DPI: 2958674130101');
  console.log('   Email: user@test.com');
  console.log('   Password: password123');
  console.log('   Nombre: María González López');
  console.log('   Teléfono: 45678901');
  console.log('\n👨‍💼 Administrador:');
  console.log('   DPI: 1234567890101');
  console.log('   Email: admin@test.com');
  console.log('   Password: admin123');
  console.log('   Nombre: Carlos Ramírez Mendoza');
  console.log('   Teléfono: 23456789');
  console.log('\n🔐 Super Administrador:');
  console.log('   DPI: 9876543210101');
  console.log('   Email: superadmin@test.com');
  console.log('   Password: superadmin123');
  console.log('   Nombre: Ana Martínez Pérez');
  console.log('   Teléfono: 34567890');
  console.log('\n🔍 Auditor:');
  console.log('   DPI: 5432167890101');
  console.log('   Email: auditor@test.com');
  console.log('   Password: auditor123');
  console.log('   Nombre: José Hernández García');
  console.log('   Teléfono: 56789012');
  console.log('==========================================\n');
}
