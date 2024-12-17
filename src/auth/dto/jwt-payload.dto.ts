export interface JwtPayloadDto {
  sessionId: string;
  iat: number; // когда создан
  exp: number; // до какого времени живёт
}
