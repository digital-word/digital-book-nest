import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { SingleResponse } from '../common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
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
}
