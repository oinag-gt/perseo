import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from '../entities/person.entity';
import { CreatePersonDto } from '../dto/create-person.dto';
import { UpdatePersonDto } from '../dto/update-person.dto';
import { PersonQueryDto } from '../dto/person-query.dto';
import { TenantService } from '../../database/tenant.service';

@Injectable()
export class PersonService {
  constructor(
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
    private readonly tenantService: TenantService,
  ) {}

  async create(createPersonDto: CreatePersonDto): Promise<Person> {
    const tenantId = this.tenantService.getCurrentTenantId();
    
    // Check for duplicate email
    const existingByEmail = await this.personRepository.findOne({
      where: { email: createPersonDto.email, tenantId },
    });
    if (existingByEmail) {
      throw new ConflictException('Person with this email already exists');
    }

    // Check for duplicate national ID
    const existingByNationalId = await this.personRepository.findOne({
      where: { nationalId: createPersonDto.nationalId, tenantId },
    });
    if (existingByNationalId) {
      throw new ConflictException('Person with this national ID already exists');
    }

    // Validate birth date is in the past
    const birthDate = new Date(createPersonDto.birthDate);
    if (birthDate >= new Date()) {
      throw new BadRequestException('Birth date must be in the past');
    }

    // Validate at least one communication preference is enabled
    const { communicationPreferences } = createPersonDto;
    if (!communicationPreferences.email && !communicationPreferences.sms && !communicationPreferences.whatsapp) {
      throw new BadRequestException('At least one communication preference must be enabled');
    }

    const person = this.personRepository.create({
      ...createPersonDto,
      birthDate,
      tenantId,
      preferredLanguage: createPersonDto.preferredLanguage || 'es',
    });

    return this.personRepository.save(person);
  }

  async findAll(query: PersonQueryDto): Promise<{ data: Person[]; total: number; totalPages: number }> {
    const tenantId = this.tenantService.getCurrentTenantId();
    const { page = 1, limit = 20, search, email, nationalId, gender, tags, isActive, createdAfter, createdBefore } = query;

    const queryBuilder = this.personRepository.createQueryBuilder('person')
      .where('person.tenantId = :tenantId', { tenantId });

    if (search) {
      queryBuilder.andWhere(
        '(person.firstName ILIKE :search OR person.lastName ILIKE :search OR person.email ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (email) {
      queryBuilder.andWhere('person.email = :email', { email });
    }

    if (nationalId) {
      queryBuilder.andWhere('person.nationalId = :nationalId', { nationalId });
    }

    if (gender) {
      queryBuilder.andWhere('person.gender = :gender', { gender });
    }

    if (tags && tags.length > 0) {
      queryBuilder.andWhere('person.tags && :tags', { tags });
    }

    if (typeof isActive === 'boolean') {
      if (isActive) {
        queryBuilder.andWhere('person.deletedAt IS NULL');
      } else {
        queryBuilder.andWhere('person.deletedAt IS NOT NULL');
      }
    }

    if (createdAfter) {
      queryBuilder.andWhere('person.createdAt >= :createdAfter', { createdAfter });
    }

    if (createdBefore) {
      queryBuilder.andWhere('person.createdAt <= :createdBefore', { createdBefore });
    }

    const total = await queryBuilder.getCount();
    const totalPages = Math.ceil(total / limit);

    const data = await queryBuilder
      .orderBy('person.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total, totalPages };
  }

  async findOne(id: string): Promise<Person> {
    const tenantId = this.tenantService.getCurrentTenantId();
    const person = await this.personRepository.findOne({
      where: { id, tenantId },
      relations: ['groupMemberships', 'documents'],
    });

    if (!person) {
      throw new NotFoundException('Person not found');
    }

    return person;
  }

  async update(id: string, updatePersonDto: UpdatePersonDto): Promise<Person> {
    const tenantId = this.tenantService.getCurrentTenantId();
    const person = await this.findOne(id);

    // Check for duplicate email if email is being updated
    if (updatePersonDto.email && updatePersonDto.email !== person.email) {
      const existingByEmail = await this.personRepository.findOne({
        where: { email: updatePersonDto.email, tenantId },
      });
      if (existingByEmail && existingByEmail.id !== id) {
        throw new ConflictException('Person with this email already exists');
      }
    }

    // Check for duplicate national ID if national ID is being updated
    if (updatePersonDto.nationalId && updatePersonDto.nationalId !== person.nationalId) {
      const existingByNationalId = await this.personRepository.findOne({
        where: { nationalId: updatePersonDto.nationalId, tenantId },
      });
      if (existingByNationalId && existingByNationalId.id !== id) {
        throw new ConflictException('Person with this national ID already exists');
      }
    }

    // Validate birth date if being updated
    if (updatePersonDto.birthDate) {
      const birthDate = new Date(updatePersonDto.birthDate);
      if (birthDate >= new Date()) {
        throw new BadRequestException('Birth date must be in the past');
      }
      updatePersonDto.birthDate = birthDate.toISOString();
    }

    // Validate communication preferences if being updated
    if (updatePersonDto.communicationPreferences) {
      const { communicationPreferences } = updatePersonDto;
      if (!communicationPreferences.email && !communicationPreferences.sms && !communicationPreferences.whatsapp) {
        throw new BadRequestException('At least one communication preference must be enabled');
      }
    }

    Object.assign(person, updatePersonDto);
    return this.personRepository.save(person);
  }

  async remove(id: string): Promise<void> {
    const person = await this.findOne(id);
    await this.personRepository.softRemove(person);
  }

  async restore(id: string): Promise<Person> {
    const tenantId = this.tenantService.getCurrentTenantId();
    const person = await this.personRepository.findOne({
      where: { id, tenantId },
      withDeleted: true,
    });

    if (!person) {
      throw new NotFoundException('Person not found');
    }

    if (!person.deletedAt) {
      throw new BadRequestException('Person is not deleted');
    }

    person.deletedAt = null;
    return this.personRepository.save(person);
  }

  async findByEmail(email: string): Promise<Person | null> {
    const tenantId = this.tenantService.getCurrentTenantId();
    return this.personRepository.findOne({
      where: { email, tenantId },
    });
  }

  async findByNationalId(nationalId: string): Promise<Person | null> {
    const tenantId = this.tenantService.getCurrentTenantId();
    return this.personRepository.findOne({
      where: { nationalId, tenantId },
    });
  }
}