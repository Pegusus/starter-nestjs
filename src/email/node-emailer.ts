import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import 'dotenv/config';

@Injectable()
export class NodemailerService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Create a nodemailer transporter with Gmail SMTP settings
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendEmail(to: string, subject: string, text: string): Promise<void> {
    // Send email using nodemailer transporter
    await this.transporter.sendMail({
      from: `"Aniruddha Guin" <${process.env.EMAIL_ADDRESS}>`,
      to,
      subject,
      text,
    });
  }
}
