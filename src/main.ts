import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    //Add your origins here
    origin: true,
  });
  await app.listen(3333);
}
bootstrap();
