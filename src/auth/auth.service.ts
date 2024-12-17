import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
import { UserDto } from './dto/user.dto';
import { ConfigService } from '@nestjs/config';
import { exec } from 'child_process';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  sanitizeSessionId(sessionId: string) {
    // 1. Валидация длины и формата
    const expectedLength = 26;
    const formatRegex = /^[a-zA-Z0-9]+$/;

    if (sessionId.length !== expectedLength || !formatRegex.test(sessionId)) {
      throw new UnauthorizedException('Неверный формат Session ID.');
    }

    // 2. Санитизация (URL-кодирование)
    const encodedSessionId = encodeURIComponent(sessionId);

    return encodedSessionId;
  }

  async checkSession(sessionId: string) {
    if (!sessionId) throw new UnauthorizedException();

    const baseUrl = this.configService.get<string>('BASE_URL');

    const loginURL = `${baseUrl}/login`;
    console.log('loginURL', loginURL);

    const sanitizedSessionId = this.sanitizeSessionId(sessionId);

    const command = `curl -sS -X POST -H "Content-Type: application/x-www-form-urlencoded" -d "LoginSessionID=${sanitizedSessionId}" "${loginURL}"`;

    // TODO НАРКОМАНЫ ИЗ ФОРПОСТА НЕ МОГУТ ОТПРАВИТЬ НОРМАЛЬНЫЕ ЗАГОЛОВКИ
    /* !!! ПРИМЕР ОТВЕТА НЕ СООТВЕТСТВУЮЩИЙ СХЕМЕ HTTP !!!
VM78 main-fetch.js:11 HTTP/1.1 200
Server: nginx
Date: Tue, 17 Dec 2024 14:11:22 GMT
Content-Type: application/json
Content-Length: 75
Connection: keep-alive
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: *
uWebSockets: 20
Strict-Transport-Security: max-age=31536000;
    includeSubDomains

{"ErrorCode":4,"Error":"Нет параметров Login или Password"}
*/

    return new Promise<boolean>((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(`Ошибка выполнения curl: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
        }

        try {
          const jsonData = JSON.parse(stdout);
          resolve(!!jsonData?.Login);
        } catch (err) {
          console.error('Ошибка парсинга JSON:', err, stdout);
          reject('Ошибка парсинга JSON');
        }
      });
    });

    // TODO ТУТ ЗАПРОС НОРМАЛЬНОГО ЧЕЛОВЕКА
    // const response = await firstValueFrom(
    //   this.httpService
    //     .post(loginURL, toUrlencoded({ LoginSessionID: sessionId }))
    //     .pipe(
    //       map((res) => !!res.data?.Login),
    //       catchError((e) => {
    //         console.error('Ошибка запроса:', e);
    //         return of(false);
    //       }),
    //     ),
    // );
    // return response;
  }

  async getTokenFromSession(user: UserDto): Promise<string> {
    const { sessionId } = user;
    const isValidSession = await this.checkSession(sessionId);
    console.log('isValidSession', isValidSession);
    if (!isValidSession) {
      throw new ForbiddenException();
    }

    const payload: Pick<JwtPayloadDto, 'sessionId'> = { sessionId };
    return this.jwtService.signAsync(payload);
  }
}
