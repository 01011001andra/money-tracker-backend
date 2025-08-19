// kalau pakai alias "@/..." aktifkan ini paling awal (opsional kalau semua import relatif)
import 'tsconfig-paths/register';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';

let server: any; // cache instance antar-invocation

export default async function handler(req: any, res: any) {
  if (!server) {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    app.setGlobalPrefix('api/v1'); // tanpa leading slash

    app.enableCors({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    });

    app.use(json({ limit: '2mb' }));
    app.use(urlencoded({ limit: '2mb', extended: true }));

    await app.init();
    server = app.getHttpAdapter().getInstance();
  }

  return server(req, res);
}
