import {Controller, Request, Post, Body, UseGuards, Get} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {AuthService, User} from "./auth/auth.service";

@Controller()
export class AppController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() user: User): Promise<{ access_token: string }> {
    const token = await this.authService.login(user);
    return { access_token: token };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('validate')
  getProfile(@Request() req) {
    return req.user;
  }
}
