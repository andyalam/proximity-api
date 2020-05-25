import { Controller, Request, UseGuards, Post, Body } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from 'src/users/users.service';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return req.user;
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.usersService.createUser(registerDto);
  }
}
