import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserDto } from './dto/user.dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(user: UserDto): Promise<string> {
    const payload = { username: user.username, sub: user.id };
    return this.jwtService.signAsync(payload);
  }
}
