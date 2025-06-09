import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber, IsUUID, IsObject, IsNotEmpty, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GroupType } from '@perseo/shared';

export class CreateGroupDto {
  @ApiProperty({ description: 'Group name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Group description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ description: 'Group type', enum: GroupType })
  @IsEnum(GroupType)
  type: GroupType;

  @ApiPropertyOptional({ description: 'Parent group ID' })
  @IsOptional()
  @IsUUID()
  parentGroupId?: string;

  @ApiPropertyOptional({ description: 'Leader person ID' })
  @IsOptional()
  @IsUUID()
  leaderId?: string;

  @ApiPropertyOptional({ description: 'Maximum number of members' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxMembers?: number;

  @ApiPropertyOptional({ description: 'Is group active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}