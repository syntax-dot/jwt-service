import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
import { UserDto } from './dto/user.dto';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { catchError, firstValueFrom, map, of } from 'rxjs';
import { toUrlencoded } from '../utils';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async checkSession(sessionId: string) {
    if (!sessionId) throw new UnauthorizedException();

    const baseUrl = this.configService.get<string>('BASE_URL');

    const loginURL = `${baseUrl}login`;
    console.log('loginURL', loginURL);

    const api = axios.create({
      baseURL: `https://test-vs.domru.ru/api/test/`,
    });

    // api.defaults.headers.common['Content-Type'] =
    //   'application/x-www-form-urlencoded';

    api.interceptors.request.use(
      async (config) => {
        console.log('config', config);
        return config;
      },
      (error) => Promise.reject(error),
    );

    const response = await firstValueFrom(
      this.httpService
        .post(loginURL, toUrlencoded({ LoginSessionID: sessionId }))
        .pipe(
          map((res) => !!res.data?.Login),
          catchError((e) => {
            console.error('Ошибка запроса:', e);
            return of(false);
          }),
        ),
    );
    return response;

    // console.log('data', data);
  }

  async getTokenFromSession(user: UserDto): Promise<string> {
    const { sessionId } = user;
    const isValidSession = await this.checkSession(sessionId);
    console.log('isValidSession', isValidSession);
    // if (!isValidSession) {
    //   throw new ForbiddenException();
    // }

    const payload: Pick<JwtPayloadDto, 'sessionId'> = { sessionId };
    return this.jwtService.signAsync(payload);
  }
}
