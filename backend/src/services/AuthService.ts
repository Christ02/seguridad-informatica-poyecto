import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { AppDataSource } from '../config/database.config';
import { User } from '../models/User.model';
import { AuthTokens, TokenPayload, TwoFactorSetup, UserRole } from '@voting-system/shared';
import securityConfig from '../config/security.config';
import { SessionService } from './SessionService';
import crypto from 'crypto';

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);
  private sessionService = new SessionService();

  /**
   * Register a new user
   */
  async register(
    email: string,
    password: string,
    role: UserRole = UserRole.VOTER
  ): Promise<{ user: User; twoFactorSetup: TwoFactorSetup }> {
    // Check if user exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Validate password strength
    if (!this.validatePasswordStrength(password)) {
      throw new Error('Password does not meet security requirements');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, securityConfig.bcrypt.rounds);

    // Generate 2FA secret
    const twoFactorSecret = speakeasy.generateSecret({
      name: `${securityConfig.twoFactor.issuer} (${email})`,
      issuer: securityConfig.twoFactor.issuer,
    });

    // Generate backup codes
    const backupCodes = this.generateBackupCodes(10);
    const hashedBackupCodes = await Promise.all(
      backupCodes.map((code) => bcrypt.hash(code, 10))
    );

    // Create user
    const user = this.userRepository.create({
      email,
      passwordHash,
      role,
      twoFactorEnabled: true,
      twoFactorSecret: twoFactorSecret.base32,
      backupCodes: hashedBackupCodes,
      isVerified: false,
      verificationToken: crypto.randomBytes(32).toString('hex'),
    });

    await this.userRepository.save(user);

    // Generate QR code
    const qrCodeUrl = await qrcode.toDataURL(twoFactorSecret.otpauth_url!);

    return {
      user,
      twoFactorSetup: {
        secret: twoFactorSecret.base32,
        qrCodeUrl,
        backupCodes,
        manualEntryKey: twoFactorSecret.base32,
      },
    };
  }

  /**
   * Login user
   */
  async login(
    email: string,
    password: string,
    twoFactorCode: string,
    deviceFingerprint?: string
  ): Promise<AuthTokens> {
    // Find user
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      throw new Error('Invalid credentials');
    }

    // Verify 2FA
    if (user.twoFactorEnabled) {
      const twoFactorValid = this.verify2FA(user.twoFactorSecret!, twoFactorCode);
      if (!twoFactorValid) {
        // Try backup codes
        const backupCodeValid = await this.verifyBackupCode(user, twoFactorCode);
        if (!backupCodeValid) {
          throw new Error('Invalid 2FA code');
        }
      }
    }

    // Update last login
    user.lastLoginAt = new Date();
    user.lastLoginDevice = deviceFingerprint;
    await this.userRepository.save(user);

    // Generate tokens
    return this.generateTokens(user, deviceFingerprint);
  }

  /**
   * Verify 2FA code
   */
  verify2FA(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: securityConfig.twoFactor.window,
    });
  }

  /**
   * Verify backup code
   */
  private async verifyBackupCode(user: User, code: string): Promise<boolean> {
    if (!user.backupCodes) return false;

    for (let i = 0; i < user.backupCodes.length; i++) {
      const isValid = await bcrypt.compare(code, user.backupCodes[i]);
      if (isValid) {
        // Remove used backup code
        user.backupCodes.splice(i, 1);
        await this.userRepository.save(user);
        return true;
      }
    }

    return false;
  }

  /**
   * Generate JWT tokens
   */
  private generateTokens(user: User, deviceFingerprint?: string): AuthTokens {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + securityConfig.jwt.accessTokenTTL,
      jti: crypto.randomUUID(),
      deviceFingerprint,
    };

    const accessToken = jwt.sign(payload, securityConfig.jwt.secret, {
      algorithm: securityConfig.jwt.algorithm,
      issuer: securityConfig.jwt.issuer,
    });

    const refreshPayload = {
      ...payload,
      exp: Math.floor(Date.now() / 1000) + securityConfig.jwt.refreshTokenTTL,
      jti: crypto.randomUUID(),
    };

    const refreshToken = jwt.sign(refreshPayload, securityConfig.jwt.refreshSecret, {
      algorithm: securityConfig.jwt.algorithm,
      issuer: securityConfig.jwt.issuer,
    });

    // Store session in Redis
    this.sessionService.createSession(user.id, {
      accessToken,
      refreshToken,
      deviceFingerprint,
      createdAt: new Date(),
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: securityConfig.jwt.accessTokenTTL,
      refreshExpiresIn: securityConfig.jwt.refreshTokenTTL,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const decoded = jwt.verify(refreshToken, securityConfig.jwt.refreshSecret) as TokenPayload;

      // Check if session is valid
      const sessionValid = await this.sessionService.validateSession(
        decoded.userId,
        refreshToken
      );
      if (!sessionValid) {
        throw new Error('Invalid session');
      }

      // Get user
      const user = await this.userRepository.findOne({ where: { id: decoded.userId } });
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      // Generate new tokens
      return this.generateTokens(user, decoded.deviceFingerprint);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Logout user
   */
  async logout(userId: string, accessToken: string): Promise<void> {
    // Invalidate session
    await this.sessionService.deleteSession(userId);

    // Add token to blacklist
    await this.sessionService.blacklistToken(accessToken);
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, securityConfig.jwt.secret) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Change password
   */
  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    // Verify old password
    const passwordValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!passwordValid) {
      throw new Error('Invalid old password');
    }

    // Validate new password
    if (!this.validatePasswordStrength(newPassword)) {
      throw new Error('New password does not meet security requirements');
    }

    // Hash new password
    user.passwordHash = await bcrypt.hash(newPassword, securityConfig.bcrypt.rounds);
    await this.userRepository.save(user);

    // Invalidate all sessions
    await this.sessionService.deleteAllUserSessions(userId);
  }

  /**
   * Validate password strength
   */
  private validatePasswordStrength(password: string): boolean {
    // Min 12 characters, at least 1 uppercase, 1 lowercase, 1 number, 1 special char
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
    return regex.test(password);
  }

  /**
   * Generate backup codes
   */
  private generateBackupCodes(count: number): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(`${code.slice(0, 4)}-${code.slice(4, 8)}`);
    }
    return codes;
  }

  /**
   * Setup 2FA for existing user
   */
  async setup2FA(userId: string): Promise<TwoFactorSetup> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const secret = speakeasy.generateSecret({
      name: `${securityConfig.twoFactor.issuer} (${user.email})`,
      issuer: securityConfig.twoFactor.issuer,
    });

    const backupCodes = this.generateBackupCodes(10);
    const hashedBackupCodes = await Promise.all(
      backupCodes.map((code) => bcrypt.hash(code, 10))
    );

    user.twoFactorSecret = secret.base32;
    user.backupCodes = hashedBackupCodes;
    user.twoFactorEnabled = true;

    await this.userRepository.save(user);

    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url!);

    return {
      secret: secret.base32,
      qrCodeUrl,
      backupCodes,
      manualEntryKey: secret.base32,
    };
  }
}

