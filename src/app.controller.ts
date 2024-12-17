import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth/auth.service';
import { UserDto } from './auth/dto/user.dto';

@Controller()
export class AppController {
  constructor(private readonly authService: AuthService) {}

  @Post('auth')
  async getTokenFromSession(
    @Body() user: UserDto,
  ): Promise<{ accessToken: string }> {
    const token = await this.authService.getTokenFromSession(user);
    return { accessToken: token };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('validate')
  validate(@Request() req) {
    return req.user;
  }
}
