// fit_cycle_app/src/dtos/auth-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user.dto';

export class AuthResponseDto {
  @ApiProperty({ description: 'JWT Access Token' })
  accessToken: string;

  @ApiProperty({ description: 'JWT Refresh Token', required: false })
  refreshToken?: string;

  @ApiProperty({ description: 'User Information', type: UserResponseDto })
  user: UserResponseDto;
}
