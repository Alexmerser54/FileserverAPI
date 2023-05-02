import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { UserDTO } from './user.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  salt: string;
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.salt = this.configService.get<string>('SALT');
  }

  async register({ login, password }: UserDTO) {
    const createUser = await this.prismaService.user.create({
      data: {
        login,
        password,
      },
    });

    if (!createUser)
      throw new HttpException(
        'Can not register user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    return { id: createUser.id, login: createUser.login };
  }

  async signIn(dto: UserDTO): Promise<any> {
    const user = await this.prismaService.user.findUnique({
      where: {
        login: dto.login,
      },
      select: {
        id: true,
        login: true,
        password: true,
      },
    });
    if (!user) {
      throw new HttpException('Can not find user', HttpStatus.NOT_FOUND);
    }

    const { password, ...result } = user;
    const jwt = await this.jwtService.signAsync(result, {
      secret: this.salt,
    });

    return { jwt };
  }
}
