// otp.service.ts

import { Injectable } from '@nestjs/common';
import { CryptService } from './crypt';
import { OTP } from '../entities/otp.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as OtpGenerator from 'otp-generator';
import { NodemailerService } from '../email/node-emailer';

@Injectable()
export class OtpService {
  constructor(
    private readonly cryptService: CryptService,
    private readonly nodemailerService: NodemailerService,
    @InjectRepository(OTP)
    private otpRepository: Repository<OTP>,
  ) {}

  async createAndSendOtp(email: string, type: string): Promise<string> {
    const date = new Date();
    const otp = OtpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
    const expiration_time = new Date(date.getTime() + 10 * 60000);
    const otpDetailsInstance = this.otpRepository.create({
      otp,
      expiration_time,
    });
    const otpDetails = await this.otpRepository.save(otpDetailsInstance);
    const details = {
      timestamp: date,
      check: email,
      success: true,
      message: 'OTP sent to user',
      otpId: otpDetails.id,
    };
    const encoded = await this.cryptService.encode(JSON.stringify(details));

    // Send email
    const email_subject = this.getEmailSubject(type);
    const email_message = this.getEmailMessage(type, otpDetails.otp);
    await this.nodemailerService.sendEmail(email, email_subject, email_message);
    return encoded;
  }

  private getEmailSubject(type: string): string {
    // Choose email subject based on type
    switch (type) {
      case 'VERIFICATION':
        return 'Email Verification OTP';
      case 'FORGET':
        return 'Password Reset OTP';
      case '2FA':
        return 'Two Factor Authentication OTP';
      default:
        throw new Error('Invalid email type');
    }
  }

  private getEmailMessage(type: string, otp: string): string {
    // Choose email message based on type and include OTP
    switch (type) {
      case 'VERIFICATION':
        return `Your email verification OTP is: ${otp}`;
      case 'FORGET':
        return `Your password reset OTP is: ${otp}`;
      case '2FA':
        return `Your two factor authentication OTP is: ${otp}`;
      default:
        throw new Error('Invalid email type');
    }
  }

  async verifyOtp(
    verificationKey: string,
    enteredOtp: number,
    check: string,
  ): Promise<string> {
    try {
      // Decrypt the verification key
      const decodedVerificationKey =
        await this.cryptService.decode(verificationKey);
      const trimmedVerificationKey = decodedVerificationKey.trim();
      console.log(trimmedVerificationKey);

      const { otpId, check: checkFromKey } = JSON.parse(trimmedVerificationKey);

      // Compare the `check` parameter with `checkFromKey` to ensure they match
      if (check !== checkFromKey) {
        throw new Error('Check values do not match');
      }

      // Retrieve the OTP instance from the database
      const otpInstance = await this.otpRepository.findOne({
        where: { id: otpId },
      });

      // Check if OTP instance exists and is not already verified
      if (otpInstance && !otpInstance.verified) {
        // Check if the entered OTP matches the stored OTP
        if (enteredOtp === parseInt(otpInstance.otp)) {
          // Mark OTP as verified
          otpInstance.verified = true;
          await this.otpRepository.save(otpInstance);
          return check; // OTP verification successful
        } else {
          throw new Error('Entered OTP does not match');
        }
      } else {
        throw new Error('Invalid OTP instance or OTP already verified');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return null; // OTP verification failed
    }
  }
}
