import {
  Controller,
  Request,
  Post,
  Body,
  UseGuards,
  Get,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth/auth.service';
import { UserDto } from './auth/dto/user.dto';

@Controller()
export class AppController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() user: UserDto): Promise<{ access_token: string }> {
    const token = await this.authService.login(user);
    return { access_token: token };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('validate')
  getProfile(@Request() req) {
    return req.user;
  }
}
