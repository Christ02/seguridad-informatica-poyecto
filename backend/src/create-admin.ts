import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './modules/users/users.service';
import { UserRole } from './common/enums/user-role.enum';
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
      firstName: 'Christian',
      lastName: 'Barrios',
      dpi: '3001234567890', // DPI de 13 dígitos
      dateOfBirth: new Date('1990-01-01'),
      phoneNumber: '12345678', // 8 dígitos
      department: 'Guatemala',
      municipality: 'Guatemala',
      address: 'Guatemala City',
      role: UserRole.ADMIN,
      isActive: true,
      isVerified: true,
    });

    console.log('✅ Usuario administrador creado exitosamente!');
    console.log('');
    console.log('📋 Detalles del usuario:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', adminUser.email);
    console.log('👤 Nombre:', adminUser.fullName);
    console.log('🔑 Rol:', adminUser.role);
    console.log('✅ Estado:', adminUser.isActive ? 'Activo' : 'Inactivo');
    console.log('🆔 ID:', adminUser.id);
    console.log('📱 DPI:', adminUser.dpi);
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
    if (error.detail) {
      console.error('Detalles:', error.detail);
    }
  } finally {
    await app.close();
  }
}

bootstrap();

