/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 **/

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const port = process.env.port || 3001;
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  });
  await app.listen(port);
}

bootstrap();
