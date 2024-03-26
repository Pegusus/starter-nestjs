import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import 'dotenv/config';

@Injectable()
export class CryptService {
  private readonly password: string;
  private readonly iv: Buffer;

  constructor() {
    this.password = process.env.CRYPT_PASSWORD;
    this.iv = crypto.randomBytes(16);
  }

  private sha1(input: string | Buffer): Buffer {
    return crypto.createHash('sha1').update(input).digest();
  }

  private passwordDeriveBytes(
    password: string,
    salt: string,
    iterations: number,
    len: number,
  ): Buffer {
    let key = Buffer.from(password + salt);
    for (let i = 0; i < iterations; i++) {
      key = this.sha1(key);
    }
    if (key.length < len) {
      const hx = this.passwordDeriveBytes(password, salt, iterations - 1, 20);
      for (let counter = 1; key.length < len; ++counter) {
        key = Buffer.concat([
          key,
          this.sha1(Buffer.concat([Buffer.from(counter.toString()), hx])),
        ]);
      }
    }
    return Buffer.alloc(len, key);
  }

  async encode(input: string): Promise<string> {
    const key = this.passwordDeriveBytes(this.password, '', 100, 32);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, this.iv);
    let encrypted = cipher.update(input, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
  }

  async decode(input: string): Promise<string> {
    try {
      const key = this.passwordDeriveBytes(this.password, '', 100, 32);
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, this.iv);
      let decrypted = decipher.update(input, 'base64', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      console.log(error.message);
      throw new Error('Decryption failed');
    }
  }
}
