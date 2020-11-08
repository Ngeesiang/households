import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import "reflect-metadata";
import * as csurf from 'csurf';
import * as helmet from 'helmet';
import * as rateLimit from 'express-rate-limit';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const options = new DocumentBuilder()
    .setTitle('Households')
    .setDescription('Household API description')
    .setVersion('1.0')
    .addTag('Household')
    .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document);

  app.use(helmet(), 
    csurf(), 
    rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  }));

  app.enableCors();

  await app.listen(3000);
}
bootstrap();
