import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable CORS
  const corsOrigins = configService.get<string>('ALLOWED_ORIGINS');
  app.enableCors({
    origin: (origin, callback) => {
      // Allow if no origin (e.g. mobile apps, postman) or if it's localhost or vercel
      if (
        !origin || 
        origin.startsWith('http://localhost') || 
        origin.endsWith('.vercel.app') ||
        (corsOrigins && corsOrigins.split(',').includes(origin))
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'api/v',
  });

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('The DABBA Company API')
    .setDescription('Production-ready subscription meal platform API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Users', 'User management')
    .addTag('Providers', 'Tiffin provider management')
    .addTag('Customers', 'Customer endpoints')
    .addTag('Orders', 'Order management')
    .addTag('Payments', 'Payment processing')
    .addTag('Admin', 'Admin operations')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('APP_PORT', 3000);
  const appUrl = configService.get<string>('APP_URL', `http://localhost:${port}`);

  await app.listen(port);
  console.log(`✅ The DABBA Company API running at ${appUrl}`);
  console.log(`📚 Swagger documentation available at ${appUrl}/api/docs`);
}

bootstrap().catch((err) => {
  console.error('❌ Failed to start application:', err);
  process.exit(1);
});
