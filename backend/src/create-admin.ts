import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './modules/users/users.service';
import { UserRole, UserStatus } from './modules/users/entities/user.entity';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  try {
    // Verificar si ya existe un admin
    const existingAdmin = await usersService.findByEmail('barriosc31@gmail.com');
    
    if (existingAdmin) {
      console.log('❌ El usuario admin ya existe');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Nombre:', existingAdmin.fullName);
      console.log('🔑 Rol:', existingAdmin.role);
      await app.close();
      return;
    }

    // Crear usuario admin
    console.log('🔨 Creando usuario administrador...');
    
    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash('Admin123!@#', 10);
    
    const adminUser = await usersService.create({
      email: 'barriosc31@gmail.com',
      password: hashedPassword,
      fullName: 'Christian Barrios',
      identificationType: 'DPI',
      identificationNumber: 'ADMIN001',
      dateOfBirth: new Date('1990-01-01'),
      phone: '+502 0000-0000',
      address: 'Guatemala',
      department: 'Guatemala',
      municipality: 'Guatemala',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    });

    console.log('✅ Usuario administrador creado exitosamente!');
    console.log('');
    console.log('📋 Detalles del usuario:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', adminUser.email);
    console.log('👤 Nombre:', adminUser.fullName);
    console.log('🔑 Rol:', adminUser.role);
    console.log('✅ Estado:', adminUser.status);
    console.log('🆔 ID:', adminUser.id);
    console.log('');
    console.log('🔐 Credenciales de acceso:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email: barriosc31@gmail.com');
    console.log('🔑 Password: Admin123!@#');
    console.log('');
    console.log('⚠️  IMPORTANTE: Cambia la contraseña después del primer login');
    console.log('');

  } catch (error) {
    console.error('❌ Error al crear usuario admin:', error.message);
  } finally {
    await app.close();
  }
}

bootstrap();

