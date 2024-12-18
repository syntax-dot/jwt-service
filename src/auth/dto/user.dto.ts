import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UserDto {
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsNumber()
  @IsNotEmpty()
  userId: string;
}
