import { Test, TestingModule } from '@nestjs/testing';
import { PersonController } from './person.controller';
import { PersonService } from '../services/person.service';
import { CreatePersonDto, UpdatePersonDto } from '../dto/person.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('PersonController', () => {
  let controller: PersonController;
  let service: PersonService;

  const mockPersonService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    restore: jest.fn(),
  };

  const mockPerson = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    birthDate: new Date('1990-01-01'),
    nationalId: '12345678',
    nationalIdType: 'DNI',
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
      controllers: [PersonController],
      providers: [
        {
          provide: PersonService,
          useValue: mockPersonService,
        },
      ],
    }).compile();

    controller = module.get<PersonController>(PersonController);
    service = module.get<PersonService>(PersonService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createPersonDto: CreatePersonDto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      birthDate: new Date('1990-01-01'),
      nationalId: '12345678',
      nationalIdType: 'DNI',
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
      mockPersonService.create.mockResolvedValue(mockPerson);

      const result = await controller.create(createPersonDto);

      expect(service.create).toHaveBeenCalledWith(createPersonDto);
      expect(result).toEqual(mockPerson);
    });

    it('should handle creation errors', async () => {
      mockPersonService.create.mockRejectedValue(
        new ConflictException('Email already exists'),
      );

      await expect(controller.create(createPersonDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated persons', async () => {
      const paginatedResult = {
        data: [mockPerson],
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
      };
      mockPersonService.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll({
        page: 1,
        limit: 10,
      });

      expect(service.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
      expect(result).toEqual(paginatedResult);
    });

    it('should handle search query', async () => {
      const paginatedResult = {
        data: [mockPerson],
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
      };
      mockPersonService.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll({
        page: 1,
        limit: 10,
        search: 'John',
      });

      expect(service.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: 'John',
      });
      expect(result).toEqual(paginatedResult);
    });
  });

  describe('findOne', () => {
    it('should return a person by id', async () => {
      mockPersonService.findOne.mockResolvedValue(mockPerson);

      const result = await controller.findOne('123e4567-e89b-12d3-a456-426614174000');

      expect(service.findOne).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
      expect(result).toEqual(mockPerson);
    });

    it('should handle person not found', async () => {
      mockPersonService.findOne.mockRejectedValue(
        new NotFoundException('Person not found'),
      );

      await expect(
        controller.findOne('nonexistent-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updatePersonDto: UpdatePersonDto = {
      firstName: 'Jane',
      lastName: 'Smith',
    };

    it('should update a person successfully', async () => {
      const updatedPerson = { ...mockPerson, ...updatePersonDto };
      mockPersonService.update.mockResolvedValue(updatedPerson);

      const result = await controller.update(
        '123e4567-e89b-12d3-a456-426614174000',
        updatePersonDto,
      );

      expect(service.update).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000',
        updatePersonDto,
      );
      expect(result).toEqual(updatedPerson);
    });

    it('should handle update errors', async () => {
      mockPersonService.update.mockRejectedValue(
        new NotFoundException('Person not found'),
      );

      await expect(
        controller.update('nonexistent-id', updatePersonDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a person successfully', async () => {
      mockPersonService.remove.mockResolvedValue(undefined);

      await controller.remove('123e4567-e89b-12d3-a456-426614174000');

      expect(service.remove).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should handle deletion errors', async () => {
      mockPersonService.remove.mockRejectedValue(
        new NotFoundException('Person not found'),
      );

      await expect(
        controller.remove('nonexistent-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('restore', () => {
    it('should restore a person successfully', async () => {
      mockPersonService.restore.mockResolvedValue(mockPerson);

      const result = await controller.restore('123e4567-e89b-12d3-a456-426614174000');

      expect(service.restore).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
      expect(result).toEqual(mockPerson);
    });

    it('should handle restoration errors', async () => {
      mockPersonService.restore.mockRejectedValue(
        new NotFoundException('Person not found'),
      );

      await expect(
        controller.restore('nonexistent-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});