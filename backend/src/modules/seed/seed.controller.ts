import { Controller, Post, HttpCode, HttpStatus, Header, Body } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UserRole } from '../../common/enums/user-role.enum';
import * as bcrypt from 'bcrypt';

@Controller('seed')
export class SeedController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create-admin')
  @HttpCode(HttpStatus.CREATED)
  @Header('Content-Type', 'application/json')
  async createAdmin(@Body() body: { secret: string }) {
    // Verificar que el secret coincida con una variable de entorno
    if (body.secret !== process.env.SEED_SECRET) {
      return {
        success: false,
        message: '❌ Acceso denegado: Secret incorrecto',
      };
    }

    try {
      // Verificar si ya existe un admin
      const existingAdmin = await this.usersService.findByEmail('barriosc31@gmail.com');
      
      if (existingAdmin) {
        return {
          success: false,
          message: '❌ El usuario admin ya existe',
          user: {
            email: existingAdmin.email,
            name: existingAdmin.fullName,
            role: existingAdmin.role,
          },
        };
      }

      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash('Admin123!@#', 10);
      
      const adminUser = await this.usersService.create({
        email: 'barriosc31@gmail.com',
        password: hashedPassword,
        firstName: 'Christian',
        lastName: 'Barrios',
        dpi: '3001234567890',
        dateOfBirth: new Date('1990-01-01'),
        phoneNumber: '12345678',
        department: 'Guatemala',
        municipality: 'Guatemala',
        address: 'Guatemala City',
        role: UserRole.ADMIN,
        isActive: true,
        isVerified: true,
      });

      return {
        success: true,
        message: '✅ Usuario administrador creado exitosamente!',
        user: {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.fullName,
          role: adminUser.role,
          dpi: adminUser.dpi,
        },
        credentials: {
          email: 'barriosc31@gmail.com',
          password: 'Admin123!@#',
        },
        warning: '⚠️  IMPORTANTE: Cambia la contraseña después del primer login',
      };
    } catch (error) {
      return {
        success: false,
        message: '❌ Error al crear usuario admin',
        error: error.message,
      };
    }
  }
}

