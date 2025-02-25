# Nest JWT Service

Этот проект представляет собой сервис аутентификации на основе JWT, разработанный с использованием [NestJS](https://nestjs.com/). Сервис выполняет проверку сессии пользователя через внешний сервис и, при успешной проверке, генерирует JWT-токен для дальнейшей аутентификации защищённых маршрутов.

## Функциональность

- **Генерация JWT-токена**  
  При отправке POST-запроса на `/auth` сервис проверяет корректность `sessionId` через внешний API и, в случае успеха, возвращает JWT-токен.

- **Валидация JWT-токена**  
  Защищённый маршрут `/validate` позволяет проверить валидность переданного JWT-токена. Для доступа к этому маршруту требуется передавать токен в заголовке `Authorization` (или в параметрах URL).

- **Проверка сессии**  
  Сессия пользователя проверяется через вызов внешнего API (временная реализация через `curl` с использованием `child_process.exec`), после чего возвращается результат проверки.

## Используемые технологии и зависимости

- **[NestJS](https://nestjs.com/)** — современный фреймворк для создания серверных приложений на Node.js.
- **[Passport.js](http://www.passportjs.org/)** — middleware для аутентификации, используемый здесь с JWT стратегией.
- **JWT (JSON Web Tokens)** — механизм для создания и валидации токенов.
- **@nestjs/config** — модуль для работы с переменными окружения.
- **@nestjs/axios** — модуль для выполнения HTTP-запросов.
- **child_process.exec** — выполнение внешней команды (`curl`) для проверки сессии.

## Установка и запуск
1. **Установите зависимости**

   ```bash
   npm install
   ```

2. **Настройте переменные окружения**

   Создайте файл `.env` в корневой директории и добавьте следующие переменные:

   ```dotenv
   JWT_SECRET=your_jwt_secret_key
   BASE_URL=http://your-base-url.com
   ```

3. **Запустите приложение**

   ```bash
   npm run start:dev
   ```

## API Endpoints

### POST `/auth`

Генерирует JWT-токен после проверки сессии.

**Тело запроса (JSON):**

```json
{
  "sessionId": "exampleSessionId",
  "username": "exampleUsername",
  "userId": 123
}
```

**Ответ:**

```json
{
  "accessToken": "your_jwt_token"
}
```

### GET `/validate`

Проверяет валидность JWT-токена. Требует аутентификации.

**Заголовки запроса:**

```
Authorization: Bearer your_jwt_token
```

**Ответ:**

```json
{
  "userId": 123,
  "username": "exampleUsername"
}
```

## Как это работает

1. **Проверка сессии**
    - Метод `sanitizeSessionId` проверяет формат и длину `sessionId`.
    - Метод `checkSession` выполняет внешний запрос (через `curl`).
    - Если в ответе присутствует поле `Login`, сессия считается валидной.

2. **Генерация JWT-токена**
    - Если сессия валидна, метод `getTokenFromSession` создаёт JWT-токен.
    - Токен подписывается `JWT_SECRET` и имеет срок действия 1 день.

3. **JWT стратегия**
    - `jwt.strategy.ts` реализует стратегию Passport для валидации JWT-токена.

4. **Защищённые маршруты**
    - `/validate` защищён `AuthGuard('jwt')`. Для доступа требуется действительный JWT-токен.
