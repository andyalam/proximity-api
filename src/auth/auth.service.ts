import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async validateUser(email: string, password: string): Promise<unknown> {
    const user = await this.usersService.findOne({ email });

    if (user && user.checkIfPasswordCorrect(password)) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }

    return null;
  }
}
