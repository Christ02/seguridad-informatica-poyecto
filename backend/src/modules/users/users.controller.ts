import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateProfileDto, ChangePasswordDto } from './dto/update-profile.dto';
import { AuditService } from '../audit/audit.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Obtener perfil del usuario actual
   */
  @Get('profile')
  async getProfile(@Request() req: any) {
    const user = await this.usersService.findOne(req.user.sub);

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // No devolver información sensible
    const { password, refreshToken, mfaSecret, ...profile } = user;

    return {
      profile: {
        ...profile,
        fullName: user.fullName,
        age: user.age,
        formattedPhone: user.formattedPhone,
      },
    };
  }

  /**
   * Actualizar perfil del usuario
   */
  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @Request() req: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const userId = req.user.sub;
    const ip = req.ip || req.connection.remoteAddress;

    // Si se está actualizando el email, verificar que no esté en uso
    if (updateProfileDto.email) {
      const existingUser = await this.usersService.findByEmail(
        updateProfileDto.email,
      );
      if (existingUser && existingUser.id !== userId) {
        throw new Error('El correo electrónico ya está en uso');
      }
    }

    // Actualizar perfil
    const updatedUser = await this.usersService.updateProfile(
      userId,
      updateProfileDto,
    );

    // Log de auditoría
    await this.auditService.logEvent(
      'PROFILE_UPDATED',
      userId,
      ip,
      'Usuario actualizó su perfil',
      { updatedFields: Object.keys(updateProfileDto) },
    );

    const { password, refreshToken, mfaSecret, ...profile } = updatedUser;

    return {
      message: 'Perfil actualizado exitosamente',
      profile: {
        ...profile,
        fullName: updatedUser.fullName,
        age: updatedUser.age,
        formattedPhone: updatedUser.formattedPhone,
      },
    };
  }

  /**
   * Cambiar contraseña
   */
  @Patch('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Request() req: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const userId = req.user.sub;
    const ip = req.ip || req.connection.remoteAddress;

    const user = await this.usersService.findOne(userId);

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Verificar contraseña actual
    const isPasswordValid = await this.usersService.validatePassword(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      await this.auditService.logEvent(
        'PASSWORD_CHANGE_FAILED',
        userId,
        ip,
        'Intento fallido de cambio de contraseña',
        { reason: 'Contraseña actual incorrecta' },
      );
      throw new Error('La contraseña actual es incorrecta');
    }

    // Actualizar contraseña
    const hashedPassword = await this.usersService.hashPassword(
      changePasswordDto.newPassword,
    );
    await this.usersService.updatePassword(userId, hashedPassword);

    // Log de auditoría
    await this.auditService.logEvent(
      'PASSWORD_CHANGED',
      userId,
      ip,
      'Usuario cambió su contraseña',
    );

    return {
      message: 'Contraseña actualizada exitosamente',
    };
  }

  /**
   * Obtener actividad reciente del usuario
   */
  @Get('activity')
  async getActivity(@Request() req: any) {
    const userId = req.user.sub;

    const activities = await this.auditService.getUserActivity(userId, 10);

    return {
      activities,
    };
  }
}

