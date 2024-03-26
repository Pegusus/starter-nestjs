import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { Controller, Injectable, Post, Req, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../entities/user.entity';
import Role from '../auth/user.constants';

@Injectable()
@Controller('/auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/login')
  async login(@Req() req: Request, @Res() res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ message: 'email and password are required' });
      }

      // Validating password before creating jwt token
      const user: User | null =
        await this.userService.getUserAndValidatePassword(email, password);

      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // JWT sign in token create
      const token = jwt.sign(
        { id: user?.id, email: user?.email, role: user?.role },
        process.env.JWT_SECRET,
        { expiresIn: '12h' },
      );
      return res.json({ token });
    } catch (error) {
      console.error(error);
      throw new Error('Internal server error');
    }
  }

  @Post('/signup')
  async signUp(@Req() req: Request, @Res() res: Response) {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        return res
          .status(400)
          .json({ message: 'email, Password, Name are required' });
      }

      const existingUser = await this.userService.getUserByemail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists, login' });
      }

      const encoded = await this.userService.signUp(
        name,
        email,
        password,
        Role.USER,
      );
      return res.json({ message: encoded });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
