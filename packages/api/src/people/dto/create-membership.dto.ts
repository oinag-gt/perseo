import { IsString, IsOptional, IsEnum, IsUUID, IsDateString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MembershipRole, MembershipStatus } from '@perseo/shared';

export class CreateMembershipDto {
  @ApiProperty({ description: 'Person ID' })
  @IsUUID()
  personId: string;

  @ApiProperty({ description: 'Group ID' })
  @IsUUID()
  groupId: string;

  @ApiPropertyOptional({ description: 'Membership role', enum: MembershipRole, default: MembershipRole.MEMBER })
  @IsOptional()
  @IsEnum(MembershipRole)
  role?: MembershipRole;

  @ApiProperty({ description: 'Start date (ISO string)' })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ description: 'End date (ISO string)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Membership status', enum: MembershipStatus, default: MembershipStatus.ACTIVE })
  @IsOptional()
  @IsEnum(MembershipStatus)
  status?: MembershipStatus;

  @ApiPropertyOptional({ description: 'Reason for membership change' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  reason?: string;
}