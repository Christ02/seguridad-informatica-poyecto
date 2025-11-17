import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configurar transporter (usando Gmail como ejemplo, pero puedes usar otro servicio)
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  /**
   * Enviar código de verificación 2FA
   */
  async send2FACode(email: string, code: string, isNewDevice: boolean) {
    try {
      // En desarrollo sin SMTP configurado, solo loggear
      if (!process.env.SMTP_USER || process.env.NODE_ENV === 'development') {
        this.logger.warn(`⚠️ MODO DESARROLLO - SMTP no configurado`);
        this.logger.warn(`📧 Código 2FA para ${email}: ${code}`);
        this.logger.warn(`🆕 Dispositivo nuevo: ${isNewDevice ? 'SÍ' : 'NO'}`);
        this.logger.warn(`⏱️  Expira en: 10 minutos`);
        console.log('\n==============================================');
        console.log(`🔐 CÓDIGO DE VERIFICACIÓN 2FA`);
        console.log(`==============================================`);
        console.log(`Email: ${email}`);
        console.log(`Código: ${code}`);
        console.log(`Dispositivo nuevo: ${isNewDevice ? 'SÍ' : 'NO'}`);
        console.log(`==============================================\n`);
        return true;
      }

      const subject = isNewDevice
        ? '🔐 Nuevo dispositivo detectado - Código de verificación'
        : '🔐 Código de verificación de dos factores';

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: #ffffff;
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #2563eb;
              margin: 0;
            }
            .code-box {
              background: #f3f4f6;
              border: 2px dashed #2563eb;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
              margin: 30px 0;
            }
            .code {
              font-size: 36px;
              font-weight: bold;
              color: #2563eb;
              letter-spacing: 8px;
              font-family: 'Courier New', monospace;
            }
            .warning {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .device-info {
              background: #f3f4f6;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Verificación de Seguridad</h1>
            </div>
            
            ${
              isNewDevice
                ? `
            <div class="warning">
              <strong>⚠️ Nuevo dispositivo detectado</strong><br>
              Hemos detectado un inicio de sesión desde un dispositivo o ubicación que no reconocemos.
            </div>
            `
                : ''
            }
            
            <p>Hola,</p>
            <p>Has solicitado iniciar sesión en tu cuenta del Sistema de Votación Seguro. Por tu seguridad, necesitamos verificar tu identidad.</p>
            
            <p><strong>Tu código de verificación es:</strong></p>
            
            <div class="code-box">
              <div class="code">${code}</div>
              <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 14px;">
                Este código expira en <strong>10 minutos</strong>
              </p>
            </div>
            
            <div class="warning">
              <strong>⚠️ Importante:</strong>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Nunca compartas este código con nadie</li>
                <li>Nuestro equipo NUNCA te pedirá este código</li>
                <li>Si no solicitaste este código, ignora este mensaje y cambia tu contraseña</li>
              </ul>
            </div>
            
            <p>Si no intentaste iniciar sesión, por favor:</p>
            <ol>
              <li>Ignora este mensaje</li>
              <li>Cambia tu contraseña inmediatamente</li>
              <li>Contacta a soporte si sospechas actividad no autorizada</li>
            </ol>
            
            <div class="footer">
              <p><strong>Sistema de Votación Seguro</strong></p>
              <p>Este es un mensaje automático, por favor no respondas a este correo.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await this.transporter.sendMail({
        from: `"Sistema de Votación Seguro" <${process.env.SMTP_USER}>`,
        to: email,
        subject,
        html,
      });

      this.logger.log(`📧 Código 2FA enviado a ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Error enviando código 2FA a ${email}:`, error);
      // En desarrollo, no fallar si no hay SMTP configurado
      if (!process.env.SMTP_USER || process.env.NODE_ENV === 'development') {
        this.logger.warn(`⚠️ Modo desarrollo: Código 2FA = ${code}`);
        return true;
      }
      throw error;
    }
  }

  /**
   * Enviar notificación de inicio de sesión exitoso
   */
  async sendLoginNotification(
    email: string,
    ipAddress: string,
    userAgent: string,
  ) {
    try {
      // En desarrollo sin SMTP, solo loggear
      if (!process.env.SMTP_USER || process.env.NODE_ENV === 'development') {
        this.logger.log(`📧 Notificación de login (modo dev): ${email} desde ${ipAddress}`);
        return;
      }

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: #ffffff;
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .info-box {
              background: #f3f4f6;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .info-item {
              margin: 10px 0;
            }
            .warning {
              background: #fee2e2;
              border-left: 4px solid #ef4444;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Inicio de sesión exitoso</h1>
            </div>
            
            <p>Hola,</p>
            <p>Te informamos que se ha iniciado sesión en tu cuenta correctamente.</p>
            
            <div class="info-box">
              <strong>Detalles del inicio de sesión:</strong>
              <div class="info-item">
                <strong>📍 Dirección IP:</strong> ${ipAddress}
              </div>
              <div class="info-item">
                <strong>💻 Navegador:</strong> ${userAgent}
              </div>
              <div class="info-item">
                <strong>🕐 Fecha y hora:</strong> ${new Date().toLocaleString('es-GT')}
              </div>
            </div>
            
            <div class="warning">
              <strong>⚠️ ¿No fuiste tú?</strong><br>
              Si no reconoces esta actividad, cambia tu contraseña inmediatamente y contacta a soporte.
            </div>
          </div>
        </body>
        </html>
      `;

      await this.transporter.sendMail({
        from: `"Sistema de Votación Seguro" <${process.env.SMTP_USER}>`,
        to: email,
        subject: '✅ Inicio de sesión en tu cuenta',
        html,
      });

      this.logger.log(`📧 Notificación de login enviada a ${email}`);
    } catch (error) {
      this.logger.error('❌ Error enviando notificación de login:', error);
      // No lanzar error para no bloquear el login
    }
  }
}

