import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { TwoFactorCode } from '../entities/two-factor-code.entity';
import { EmailService } from './email.service';
import * as crypto from 'crypto';

@Injectable()
export class TwoFactorService {
  private readonly logger = new Logger(TwoFactorService.name);

  constructor(
    @InjectRepository(TwoFactorCode)
    private readonly twoFactorCodeRepository: Repository<TwoFactorCode>,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Generar código de 6 dígitos
   */
  private generateCode(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Detectar si es un dispositivo nuevo
   * (Lógica simple: buscar códigos anteriores con mismo user-agent)
   */
  private async isNewDevice(
    userId: string,
    userAgent: string,
  ): Promise<boolean> {
    const existingCode = await this.twoFactorCodeRepository.findOne({
      where: {
        userId,
        userAgent,
        isUsed: true,
      },
    });

    return !existingCode; // Si no hay código anterior con mismo user-agent, es nuevo dispositivo
  }

  /**
   * Generar y enviar código 2FA
   */
  async generateAndSend2FACode(
    userId: string,
    email: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<string> {
    try {
      // Invalidar códigos anteriores no usados del usuario
      await this.twoFactorCodeRepository.update(
        {
          userId,
          isUsed: false,
        },
        {
          isUsed: true, // Marcar como usados para que no puedan ser reutilizados
        },
      );

      // Generar nuevo código
      const code = this.generateCode();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10); // Expira en 10 minutos

      // Detectar si es nuevo dispositivo
      const isNewDevice = await this.isNewDevice(userId, userAgent);

      // Guardar código en BD
      const twoFactorCode = this.twoFactorCodeRepository.create({
        userId,
        code,
        expiresAt,
        ipAddress,
        userAgent,
        isNewDevice,
      });

      await this.twoFactorCodeRepository.save(twoFactorCode);

      // Enviar código por email
      await this.emailService.send2FACode(email, code, isNewDevice);

      this.logger.log(
        `🔐 Código 2FA generado para usuario ${userId} ${isNewDevice ? '(NUEVO DISPOSITIVO)' : ''}`,
      );

      return twoFactorCode.id;
    } catch (error) {
      this.logger.error('❌ Error generando código 2FA:', error);
      throw error;
    }
  }

  /**
   * Verificar código 2FA
   */
  async verify2FACode(
    userId: string,
    code: string,
  ): Promise<{ valid: boolean; codeId?: string }> {
    try {
      // Buscar código válido
      const twoFactorCode = await this.twoFactorCodeRepository.findOne({
        where: {
          userId,
          code,
          isUsed: false,
        },
      });

      if (!twoFactorCode) {
        this.logger.warn(`⚠️ Código 2FA inválido para usuario ${userId}`);
        return { valid: false };
      }

      // Verificar si el código expiró
      if (new Date() > twoFactorCode.expiresAt) {
        this.logger.warn(`⚠️ Código 2FA expirado para usuario ${userId}`);
        await this.twoFactorCodeRepository.update(twoFactorCode.id, {
          isUsed: true,
        });
        return { valid: false };
      }

      // Marcar código como usado
      await this.twoFactorCodeRepository.update(twoFactorCode.id, {
        isUsed: true,
      });

      this.logger.log(`✅ Código 2FA verificado exitosamente para usuario ${userId}`);

      return { valid: true, codeId: twoFactorCode.id };
    } catch (error) {
      this.logger.error('❌ Error verificando código 2FA:', error);
      throw error;
    }
  }

  /**
   * Limpiar códigos expirados (ejecutar periódicamente)
   */
  async cleanExpiredCodes(): Promise<void> {
    try {
      const result = await this.twoFactorCodeRepository.delete({
        expiresAt: LessThan(new Date()),
        isUsed: true,
      });

      if (result.affected && result.affected > 0) {
        this.logger.log(
          `🧹 ${result.affected} código(s) 2FA expirado(s) eliminado(s)`,
        );
      }
    } catch (error) {
      this.logger.error('❌ Error limpiando códigos expirados:', error);
    }
  }
}

