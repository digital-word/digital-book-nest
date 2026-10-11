import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { SingleResponse } from '../common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from './decorators/public.decorator';
import { RefreshedUser } from './interfaces/refreshed-user.interface';
import { User } from 'firebase/auth';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginDto): Promise<SingleResponse<User>> {
    const data = await this.authService.login(body.email, body.password);
    return new SingleResponse(data, 'Login successful');
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() body: RefreshTokenDto,
  ): Promise<SingleResponse<RefreshedUser>> {
    const data = await this.authService.refresh(body.refreshToken);
    return new SingleResponse(data, 'Token refreshed');
  }

  @Get('logout')
  @HttpCode(HttpStatus.OK)
  async logout(): Promise<SingleResponse<string>> {
    await this.authService.logout();
    return new SingleResponse('Logout successful');
  }
}
