import { IsOptional, IsString, IsEnum, IsBoolean, IsDateString, IsNumber, Min, Max, IsUUID } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { GroupType } from '@perseo/shared';

export class GroupQueryDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Search term for group names and descriptions' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by group type', enum: GroupType })
  @IsOptional()
  @IsEnum(GroupType)
  type?: GroupType;

  @ApiPropertyOptional({ description: 'Filter by parent group ID' })
  @IsOptional()
  @IsUUID()
  parentGroupId?: string;

  @ApiPropertyOptional({ description: 'Filter by leader ID' })
  @IsOptional()
  @IsUUID()
  leaderId?: string;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Filter groups that have members' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  hasMembers?: boolean;

  @ApiPropertyOptional({ description: 'Filter by creation date (after)' })
  @IsOptional()
  @IsDateString()
  createdAfter?: string;

  @ApiPropertyOptional({ description: 'Filter by creation date (before)' })
  @IsOptional()
  @IsDateString()
  createdBefore?: string;
}