import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FirebaseConfigService } from '../config/firebase.config';

@Module({
  controllers: [AuthController],
  providers: [AuthService, FirebaseConfigService],
})
export class AuthModule {}
