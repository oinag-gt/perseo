import { IsString, IsEmail, IsOptional, IsEnum, IsArray, IsDateString, IsObject, ValidateNested, ArrayMaxSize, MaxLength, IsBoolean, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender, NationalIdType } from '@perseo/shared';

export class AddressDto {
  @ApiProperty({ description: 'Street address' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  street: string;

  @ApiProperty({ description: 'City' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @ApiProperty({ description: 'State or province' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  state: string;

  @ApiProperty({ description: 'Postal/ZIP code' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  postalCode: string;

  @ApiProperty({ description: 'Country' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  country: string;
}

export class EmergencyContactDto {
  @ApiProperty({ description: 'Emergency contact name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Relationship to person' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  relationship: string;

  @ApiProperty({ description: 'Emergency contact phone' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({ description: 'Emergency contact email' })
  @IsOptional()
  @IsEmail()
  email?: string;
}

export class CommunicationPreferencesDto {
  @ApiProperty({ description: 'Allow email communication' })
  @IsBoolean()
  email: boolean;

  @ApiProperty({ description: 'Allow SMS communication' })
  @IsBoolean()
  sms: boolean;

  @ApiProperty({ description: 'Allow WhatsApp communication' })
  @IsBoolean()
  whatsapp: boolean;
}

export class CreatePersonDto {
  @ApiProperty({ description: 'First name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  firstName: string;

  @ApiProperty({ description: 'Last name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  lastName: string;

  @ApiProperty({ description: 'Email address' })
  @IsEmail()
  @MaxLength(100)
  email: string;

  @ApiPropertyOptional({ description: 'Alternate email addresses', type: [String] })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  @ArrayMaxSize(5)
  alternateEmails?: string[];

  @ApiProperty({ description: 'Phone number' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({ description: 'Alternate phone numbers', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(5)
  alternatePhones?: string[];

  @ApiProperty({ description: 'Birth date (ISO string)' })
  @IsDateString()
  birthDate: string;

  @ApiProperty({ description: 'National ID number' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  nationalId: string;

  @ApiProperty({ description: 'National ID type', enum: NationalIdType })
  @IsEnum(NationalIdType)
  nationalIdType: NationalIdType;

  @ApiPropertyOptional({ description: 'Gender', enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({ description: 'Address information', type: AddressDto })
  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @ApiProperty({ description: 'Emergency contact information', type: EmergencyContactDto })
  @IsObject()
  @ValidateNested()
  @Type(() => EmergencyContactDto)
  emergencyContact: EmergencyContactDto;

  @ApiPropertyOptional({ description: 'Preferred language', enum: ['es', 'en'] })
  @IsOptional()
  @IsEnum(['es', 'en'])
  preferredLanguage?: 'es' | 'en';

  @ApiProperty({ description: 'Communication preferences', type: CommunicationPreferencesDto })
  @IsObject()
  @ValidateNested()
  @Type(() => CommunicationPreferencesDto)
  communicationPreferences: CommunicationPreferencesDto;

  @ApiPropertyOptional({ description: 'Photo URL' })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional({ description: 'Tags for categorization', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(20)
  tags?: string[];
}