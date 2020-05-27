import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string): Promise<unknown> {
    const user = await this.usersService.findOne({ email });

    if (user && user.checkIfPasswordCorrect(password)) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }

    return null;
  }

  async login(user) {
    const payload = { username: user.username, sub: user.userId };

    return {
      accessToken: this.jwtService.sign(payload)
    };
  }
}
