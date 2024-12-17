import {Controller, Request, Post, UseGuards} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {AuthService} from "./auth/auth.service";

@Controller()
export class AppController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
