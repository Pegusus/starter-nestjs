import { Controller, Post, Body, Req, Res } from '@nestjs/common';
import { OtpService } from './otp.service';
import { UserService } from './user.service';
import * as jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

@Controller('otp')
export class OtpController {
  constructor(
    private readonly otpService: OtpService,
    private readonly userService: UserService,
  ) {}

  @Post('email')
  async sendOtpEmail(@Body() body: any) {
    try {
      const { email, type } = body;
      if (!email || !type) {
        throw new Error('Email or type not provided');
      }
      const encoded = await this.otpService.createAndSendOtp(email, type);

      return {
        status: 'success',
        message: 'OTP sent to email',
        details: encoded,
      };
    } catch (error) {
      console.error('Error sending OTP email:', error);
      return { status: 'error', message: 'Failed to send OTP email' };
    }
  }

  @Post('verify')
  async verifyOtp(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: any,
  ) {
    try {
      const { verificationKey, enteredOtp, check } = body;
      if (!verificationKey || !enteredOtp || !check) {
        throw new Error('Missing required parameters');
      }
      const emailOtpVerified = await this.otpService.verifyOtp(
        verificationKey,
        enteredOtp,
        check,
      );

      if (emailOtpVerified) {
        // user verified
        console.log(emailOtpVerified);
        const user = await this.userService.verifyUser(emailOtpVerified, true);

        const token = jwt.sign(
          { id: user.id, email: user.email, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: '12h' },
        );
        return res.status(200).json({ token });
      } else {
        return { status: 'error', message: 'OTP verification failed' };
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return { status: 'error', message: 'Internal server error' };
    }
  }
}
