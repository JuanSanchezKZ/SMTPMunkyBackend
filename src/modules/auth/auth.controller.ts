import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';
import { AuthService } from './auth.service';
import { CurrentUser, CurrentUserData } from './current-user.decorator';
import { AuthGuardOptional } from './auth.guard';

class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  // No necesita guardián, es el punto de entrada
  async login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuardOptional) // Solo para conocer quién es el usuario actual
  @Get('me')
  async me(@CurrentUser() user: CurrentUserData) {
    // Si el guard es opcional, user podría ser undefined
    return this.auth.me(user?.userId);
  }
}
