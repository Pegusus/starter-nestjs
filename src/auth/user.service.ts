import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import Role from '../auth/user.constants';
import { OtpService } from '../auth/otp.service';

@Injectable()
export class UserService {
  constructor(
    private readonly otpService: OtpService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getUserAndValidatePassword(
    email: string,
    password: string,
  ): Promise<User | null> {
    try {
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        return null;
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return null;
      }

      return user;
    } catch (error) {
      console.error(
        'Error fetching user by email or validating password:',
        error,
      );
      throw error;
    }
  }

  async signUp(name: string, email: string, password: string, role: Role) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = this.userRepository.create({
        name,
        email,
        password: hashedPassword,
        role: role,
        is_verified: false,
      });
      await this.userRepository.save(newUser);
      const encoded = await this.otpService.createAndSendOtp(
        email,
        'VERIFICATION',
      );
      return encoded;
    } catch (error) {
      console.error(error);
      throw new Error('Internal server error');
    }
  }

  async getUserByemail(email: string): Promise<User | null> {
    try {
      const user = await this.userRepository.findOne({ where: { email } });
      return user;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw error;
    }
  }

  async verifyUser(
    email: string,
    isVerified: boolean = false,
  ): Promise<User | null> {
    try {
      const user = await this.userRepository.findOne({ where: { email } });
      user.is_verified = isVerified;
      const updatedUser = await this.userRepository.save(user);
      return updatedUser;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
