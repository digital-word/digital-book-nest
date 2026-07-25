import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'test1@email.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'test12026' })
  @IsString()
  @MinLength(6)
  password!: string;
}
