import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { getRepository, Repository } from 'typeorm';

import { RegisterDto } from 'src/auth/dto/register.dto';
import { UserEntity } from 'src/users/user.entity';
import { validate } from 'class-validator';
import { InjectRepository } from '@nestjs/typeorm';

export type User = any;

export interface UserJSON {
  id: number;
  email: string;
  username: string;
}

@Injectable()
export class UsersService {
  private readonly users: User[];

  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>
  ) {
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

  async findOne(params: {
    username?: string;
    email?: string;
  }): Promise<UserEntity> {
    const { username, email } = params;

    if (!username && !email) {
      throw new HttpException(
        {
          message: 'Input data validation failed',
          errors: { usernameOrEmail: 'Username or email must be provided' }
        },
        HttpStatus.BAD_REQUEST
      );
    }

    let qb = await getRepository(UserEntity).createQueryBuilder('user');
    qb = username
      ? qb.where('username = :username', { username })
      : qb.where('email = :email', { email });

    const user = await qb.getOne();

    if (!user) {
      throw new HttpException(
        {
          message: 'User not found'
        },
        HttpStatus.NOT_FOUND
      );
    }

    return user;
  }

  async createUser(registerDto: RegisterDto): Promise<UserJSON> {
    const { username, email, password } = registerDto;

    const qb = await getRepository(UserEntity)
      .createQueryBuilder('user')
      .where('username = :username', { username })
      .orWhere('email = :email', { email });

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

    const savedUser = await this.usersRepository.save(newUser);
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
