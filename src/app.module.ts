import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as path from 'path';
import { User } from './entities/user.entity';
import { UserController } from './auth/user.controller';
import { UserService } from './auth/user.service';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { Category } from './entities/category.entity';

import 'dotenv/config';
import { OtpController } from './auth/otp.controller';
import { OtpService } from './auth/otp.service';
import { OTP } from './entities/otp.entity';
import { NodemailerService } from './email/node-emailer';
import { CryptService } from './auth/crypt';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DB_URL,
      entities: [path.join(__dirname, 'entities', '*.entity{.ts,.js}')],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User, Category, OTP]),
  ],
  controllers: [
    AppController,
    UserController,
    CategoryController,
    OtpController,
  ],
  providers: [
    AppService,
    UserService,
    CategoryService,
    OtpService,
    NodemailerService,
    CryptService,
  ],
})
export class AppModule {}
