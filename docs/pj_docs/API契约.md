# API 契约文档 (API Contract)

## 1. 介绍 (Introduction)

- **基准 URL (Base URL)**: `/`
- **数据格式 (Data Format)**: `application/json`
- **认证 (Authentication)**: `Authorization: Bearer <JWT_TOKEN>`

## 2. 通用数据结构 (Common DTOs)

### `UserDto`
```typescript
interface UserDto {
  id: number;
  nickname: string;
  avatar: string; // URL
  target_calories: number;
  target_protein: number;
  // ... 其他字段
}
```

## 3. 模块: 认证 (Module: Auth)

### `POST /auth/login`

**描述**: 用户通过微信 `code` 进行登录或注册。
**认证**: 无需。

#### 请求体 (Request Body)
`LoginRequestDto`
```json
{
  "code": "string"
}
```
- `code` (string, required): 通过 `Taro.login()` 获取的临时登录凭证。

#### 响应 (Responses)

- **`201 Created` - 成功**
  `LoginResponseDto`
  ```json
  {
    "token": "string",
    "user": {
      "id": 1,
      "nickname": "微信用户",
      "avatar": "https://.../avatar.jpg",
      "target_calories": 2000,
      "target_protein": 150
    }
  }
  ```

- **`400 Bad Request` - 请求体验证失败**
  ```json
  {
    "statusCode": 400,
    "message": "code should not be empty",
    "error": "Bad Request"
  }
  ```
---
