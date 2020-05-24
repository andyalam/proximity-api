import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Connection, getRepository, Repository } from 'typeorm';

import { RegisterDto } from 'src/auth/dto/register.dto';
import { UserEntity } from 'src/users/user.entity';
import { validate } from 'class-validator';

export type User = any;

export interface UserJSON {
  id: number;
  email: string;
  username: string;
}

@Injectable()
export class UsersService {
  private readonly users: User[];

  constructor(private readonly userRepository: Repository<UserEntity>) {
    this.users = [
      {
        userId: 1,
        username: 'john',
        password: 'changeme'
      },
      {
        userId: 2,
        username: 'chris',
        password: 'secret'
      },
      {
        userId: 3,
        username: 'maria',
        password: 'guess'
      }
    ];
  }

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find(u => u.username === username);
  }

  async createUser(registerDto: RegisterDto) {
    const { username, email, password } = registerDto;

    const qb = await getRepository(UserEntity)
      .createQueryBuilder('user')
      .where('user.username = :username', { username })
      .orWhere('user.email = :email', { email });

    const user = await qb.getOne();

    if (user) {
      throw new HttpException(
        {
          message: 'Input data validation failed',
          errors: { username: 'Username and email must be unique.' }
        },
        HttpStatus.BAD_REQUEST
      );
    }

    const newUser = new UserEntity();
    newUser.username = username;
    newUser.email = email;
    newUser.password = password;

    const errors = await validate(newUser);
    if (errors.length > 0) {
    }

    const savedUser = await this.userRepository.save(newUser);
    return this.userJSON(savedUser);
  }

  private userJSON(user: UserEntity): UserJSON {
    return {
      id: user.id,
      email: user.email,
      username: user.username
    };
  }
}
