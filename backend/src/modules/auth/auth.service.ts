import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { AuditService } from '../audit/audit.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private auditService: AuditService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ user: Partial<User> }> {
    // Verificar si el usuario ya existe
    const existingUser = await this.usersService.findByEmail(
      registerDto.email,
    );
    if (existingUser) {
      throw new BadRequestException('El correo electrónico ya está registrado');
    }

    const existingDpi = await this.usersService.findByDpi(registerDto.dpi);
    if (existingDpi) {
      throw new BadRequestException('El DPI ya está registrado');
    }

    // Validar edad mínima (18 años para votar en Guatemala)
    const birthDate = new Date(registerDto.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18) {
      throw new BadRequestException('Debes tener al menos 18 años para registrarte');
    }

    // Hash de la contraseña
    const hashedPassword = await this.usersService.hashPassword(
      registerDto.password,
    );

    // Crear usuario
    const user = await this.usersService.create({
      email: registerDto.email,
      dpi: registerDto.dpi,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      dateOfBirth: new Date(registerDto.dateOfBirth),
      phoneNumber: registerDto.phoneNumber,
      department: registerDto.department,
      municipality: registerDto.municipality,
      address: registerDto.address,
      password: hashedPassword,
      isActive: true,
      isVerified: false, // Requiere verificación de email
    });

    // No devolver la contraseña
    const { password, refreshToken, ...userWithoutSensitiveData } = user;

    return { user: userWithoutSensitiveData };
  }

  async login(
    loginDto: LoginDto,
    ip: string,
  ): Promise<{
    user: Partial<User>;
    accessToken: string;
    refreshToken: string;
  }> {
    // Buscar usuario por email o número de identificación
    let user = await this.usersService.findByEmail(loginDto.identifier);
    if (!user) {
      user = await this.usersService.findByIdentificationNumber(
        loginDto.identifier,
      );
    }

    if (!user) {
      // Log intento fallido
      await this.auditService.logLoginFailed(
        loginDto.identifier,
        ip,
        '',
        'Usuario no encontrado',
      );
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña
    const isPasswordValid = await this.usersService.validatePassword(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      // Log intento fallido
      await this.auditService.logLoginFailed(
        user.email,
        ip,
        '',
        'Contraseña incorrecta',
      );
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      await this.auditService.logLoginFailed(
        user.email,
        ip,
        '',
        'Usuario inactivo',
      );
      throw new UnauthorizedException('Usuario inactivo');
    }

    // TODO: Verificar MFA si está habilitado
    // if (user.mfaEnabled && !loginDto.mfaCode) {
    //   return { requiresMFA: true };
    // }

    // Generar tokens
    const tokens = await this.generateTokens(user);

    // Log login exitoso
    await this.auditService.logLogin(user.id, user.email, ip, '');

    // Guardar refresh token hasheado
    const hashedRefreshToken = await this.usersService.hashPassword(
      tokens.refreshToken,
    );
    await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);

    // Actualizar último login
    await this.usersService.updateLastLogin(user.id, ip);

    // No devolver datos sensibles
    const { password, refreshToken, ...userWithoutSensitiveData } = user;

    return {
      user: userWithoutSensitiveData,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.updateRefreshToken(userId, null);
  }

  async refreshTokens(
    userId: string,
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.usersService.findOne(userId);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Acceso denegado');
    }

    // Verificar refresh token
    const isTokenValid = await this.usersService.validatePassword(
      refreshToken,
      user.refreshToken,
    );

    if (!isTokenValid) {
      throw new UnauthorizedException('Acceso denegado');
    }

    // Generar nuevos tokens
    const tokens = await this.generateTokens(user);

    // Actualizar refresh token
    const hashedRefreshToken = await this.usersService.hashPassword(
      tokens.refreshToken,
    );
    await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);

    return tokens;
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.usersService.findOne(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuario no encontrado o inactivo');
    }
    return user;
  }

  private async generateTokens(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION') || '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}

