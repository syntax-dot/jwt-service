import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface User {
    id: number;
    username: string;
}

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService) {}

    async login(user: User): Promise<string> {
        const payload = { username: user.username, sub: user.id };
        return this.jwtService.signAsync(payload);
    }
}
