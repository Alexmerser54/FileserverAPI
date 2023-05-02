import { Body, Controller, Post } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserDTO } from './user.dto';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('reg')
  async register(@Body() { login, password }: UserDTO) {
    const result = await this.authService.register({ login, password });
    return result;
  }

  @Post('login')
  async login(@Body() { login, password }: UserDTO) {
    const result = await this.authService.signIn({ login, password });
    return result;
  }
}
