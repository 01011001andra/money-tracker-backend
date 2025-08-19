import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.setGlobalPrefix('/api/v1');
  app.enableCors({
    origin: ['http://localhost', 'https://musyan.vercel.app'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });
  app.use(json({ limit: '2mb' }));
  app.use(urlencoded({ limit: '2mb', extended: true }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
