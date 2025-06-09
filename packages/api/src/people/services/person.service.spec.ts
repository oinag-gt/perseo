import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PersonService } from './person.service';
import { Person } from '../entities/person.entity';
import { TenantService } from '../../database/tenant.service';
import { CreatePersonDto } from '../dto/create-person.dto';
import { UpdatePersonDto } from '../dto/update-person.dto';
import { NationalIdType } from '@perseo/shared';

describe('PersonService', () => {
  let service: PersonService;
  let repository: Repository<Person>;
  let tenantService: TenantService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockTenantService = {
    getCurrentTenantId: jest.fn(),
  };

  const mockPerson: Partial<Person> = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    birthDate: new Date('1990-01-01'),
    nationalId: '12345678',
    nationalIdType: NationalIdType.DNI,
    address: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      postalCode: '12345',
      country: 'USA',
    },
    emergencyContact: {
      name: 'Jane Doe',
      relationship: 'Spouse',
      phone: '+1234567891',
      email: 'jane.doe@example.com',
    },
    communicationPreferences: {
      email: true,
      sms: false,
      whatsapp: false,
    },
    tenantId: 'tenant-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PersonService,
        {
          provide: getRepositoryToken(Person),
          useValue: mockRepository,
        },
        {
          provide: TenantService,
          useValue: mockTenantService,
        },
      ],
    }).compile();

    service = module.get<PersonService>(PersonService);
    repository = module.get<Repository<Person>>(getRepositoryToken(Person));
    tenantService = module.get<TenantService>(TenantService);

    // Reset mocks before each test
    jest.clearAllMocks();
    mockTenantService.getCurrentTenantId.mockReturnValue('tenant-123');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createPersonDto: CreatePersonDto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      birthDate: '1990-01-01',
      nationalId: '12345678',
      nationalIdType: NationalIdType.DNI,
      address: {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        postalCode: '12345',
        country: 'USA',
      },
      emergencyContact: {
        name: 'Jane Doe',
        relationship: 'Spouse',
        phone: '+1234567891',
        email: 'jane.doe@example.com',
      },
      communicationPreferences: {
        email: true,
        sms: false,
        whatsapp: false,
      },
    };

    it('should create a person successfully', async () => {
      mockRepository.findOne.mockResolvedValue(null); // No duplicates
      mockRepository.create.mockReturnValue(mockPerson);
      mockRepository.save.mockResolvedValue(mockPerson);

      const result = await service.create(createPersonDto);

      expect(mockRepository.findOne).toHaveBeenCalledTimes(2); // Check email and nationalId
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createPersonDto,
        tenantId: 'tenant-123',
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockPerson);
      expect(result).toEqual(mockPerson);
    });

    it('should throw ConflictException if email already exists', async () => {
      mockRepository.findOne.mockResolvedValueOnce(mockPerson); // Email exists

      await expect(service.create(createPersonDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: createPersonDto.email, tenantId: 'tenant-123' },
      });
    });

    it('should throw ConflictException if nationalId already exists', async () => {
      mockRepository.findOne
        .mockResolvedValueOnce(null) // Email doesn't exist
        .mockResolvedValueOnce(mockPerson); // NationalId exists

      await expect(service.create(createPersonDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { nationalId: createPersonDto.nationalId, tenantId: 'tenant-123' },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated persons', async () => {
      const persons = [mockPerson];
      mockRepository.findAndCount.mockResolvedValue([persons, 1]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-123' },
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual({
        data: persons,
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
      });
    });

    it('should search persons by name or email', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockPerson], 1]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll({ page: 1, limit: 10, search: 'John' });

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('person');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('person.tenantId = :tenantId', {
        tenantId: 'tenant-123',
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
      expect(result.data).toEqual([mockPerson]);
    });
  });

  describe('findOne', () => {
    it('should return a person by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockPerson);

      const result = await service.findOne('123e4567-e89b-12d3-a456-426614174000');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '123e4567-e89b-12d3-a456-426614174000', tenantId: 'tenant-123' },
      });
      expect(result).toEqual(mockPerson);
    });

    it('should throw NotFoundException if person not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updatePersonDto: UpdatePersonDto = {
      firstName: 'Jane',
      lastName: 'Smith',
    };

    it('should update a person successfully', async () => {
      mockRepository.findOne.mockResolvedValue(mockPerson);
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValueOnce(mockPerson).mockResolvedValueOnce({
        ...mockPerson,
        ...updatePersonDto,
      });

      const result = await service.update('123e4567-e89b-12d3-a456-426614174000', updatePersonDto);

      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: '123e4567-e89b-12d3-a456-426614174000', tenantId: 'tenant-123' },
        updatePersonDto,
      );
      expect(result).toEqual({ ...mockPerson, ...updatePersonDto });
    });

    it('should throw NotFoundException if person not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('nonexistent-id', updatePersonDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if email already exists', async () => {
      const updateWithEmail = { email: 'existing@example.com' };
      mockRepository.findOne
        .mockResolvedValueOnce(mockPerson) // Person exists
        .mockResolvedValueOnce({ id: 'different-id' }); // Email exists for different person

      await expect(
        service.update('123e4567-e89b-12d3-a456-426614174000', updateWithEmail),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should soft delete a person successfully', async () => {
      mockRepository.findOne.mockResolvedValue(mockPerson);
      mockRepository.softDelete.mockResolvedValue({ affected: 1 });

      await service.remove('123e4567-e89b-12d3-a456-426614174000');

      expect(mockRepository.softDelete).toHaveBeenCalledWith({
        id: '123e4567-e89b-12d3-a456-426614174000',
        tenantId: 'tenant-123',
      });
    });

    it('should throw NotFoundException if person not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('restore', () => {
    it('should restore a soft-deleted person successfully', async () => {
      mockRepository.restore.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(mockPerson);

      const result = await service.restore('123e4567-e89b-12d3-a456-426614174000');

      expect(mockRepository.restore).toHaveBeenCalledWith({
        id: '123e4567-e89b-12d3-a456-426614174000',
        tenantId: 'tenant-123',
      });
      expect(result).toEqual(mockPerson);
    });
  });
});