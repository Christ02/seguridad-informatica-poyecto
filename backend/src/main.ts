import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS - Configuración mejorada para producción (ANTES de helmet)
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      const allowedOrigins: (string | RegExp)[] = [
        'http://localhost:3000',
        'https://frontend-delta-six-81.vercel.app',
        /^https:\/\/frontend-.*\.vercel\.app$/, // Permite todos los deployments de Vercel
      ];
      
      // Permitir peticiones sin origin (como Postman, curl, etc.)
      if (!origin) {
        callback(null, true);
        return;
      }
      
      // Verificar si el origin está permitido
      const isAllowed = allowedOrigins.some(allowed => 
        typeof allowed === 'string' ? allowed === origin : allowed.test(origin)
      );
      
      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`🚫 CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
      'X-CSRF-Token',
      'X-Request-Time',
      'X-Request-ID',
      'X-Body-Hash',
    ],
    exposedHeaders: ['Authorization', 'X-CSRF-Token'],
    maxAge: 86400, // 24 horas
  });

  // Security headers (DESPUÉS de CORS)
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    })
  );

  // Global prefix
  app.setGlobalPrefix(process.env.API_PREFIX || 'api/v1');

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 4000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Prefix: ${process.env.API_PREFIX || 'api/v1'}`);
  console.log(`🔒 Security: Helmet, CORS, Validation enabled`);
}
bootstrap();
