import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { PersonService } from '../services/person.service';
import { CreatePersonDto } from '../dto/create-person.dto';
import { UpdatePersonDto } from '../dto/update-person.dto';
import { PersonQueryDto } from '../dto/person-query.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Person } from '../entities/person.entity';

@ApiTags('people')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('people/persons')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new person' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Person has been successfully created.',
    type: Person,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Person with email or national ID already exists.',
  })
  async create(@Body() createPersonDto: CreatePersonDto): Promise<Person> {
    return this.personService.create(createPersonDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all persons with pagination and filtering' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of persons retrieved successfully.',
  })
  async findAll(@Query() query: PersonQueryDto) {
    return this.personService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a person by ID' })
  @ApiParam({ name: 'id', description: 'Person ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Person retrieved successfully.',
    type: Person,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Person not found.',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Person> {
    return this.personService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a person' })
  @ApiParam({ name: 'id', description: 'Person ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Person has been successfully updated.',
    type: Person,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Person not found.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Person with email or national ID already exists.',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePersonDto: UpdatePersonDto,
  ): Promise<Person> {
    return this.personService.update(id, updatePersonDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a person' })
  @ApiParam({ name: 'id', description: 'Person ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Person has been successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Person not found.',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.personService.remove(id);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted person' })
  @ApiParam({ name: 'id', description: 'Person ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Person has been successfully restored.',
    type: Person,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Person not found.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Person is not deleted.',
  })
  async restore(@Param('id', ParseUUIDPipe) id: string): Promise<Person> {
    return this.personService.restore(id);
  }

  @Get('search/email/:email')
  @ApiOperation({ summary: 'Find person by email' })
  @ApiParam({ name: 'email', description: 'Email address' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Person found.',
    type: Person,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Person not found.',
  })
  async findByEmail(@Param('email') email: string): Promise<Person> {
    const person = await this.personService.findByEmail(email);
    if (!person) {
      throw new Error('Person not found');
    }
    return person;
  }

  @Get('search/national-id/:nationalId')
  @ApiOperation({ summary: 'Find person by national ID' })
  @ApiParam({ name: 'nationalId', description: 'National ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Person found.',
    type: Person,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Person not found.',
  })
  async findByNationalId(@Param('nationalId') nationalId: string): Promise<Person> {
    const person = await this.personService.findByNationalId(nationalId);
    if (!person) {
      throw new Error('Person not found');
    }
    return person;
  }
}