import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty({ example: 'NewSecurePassword123!' })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  newPassword: string;
}