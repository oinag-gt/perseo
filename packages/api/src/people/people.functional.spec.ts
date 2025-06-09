import { Test, TestingModule } from '@nestjs/testing';
import { PersonService } from './services/person.service';
import { GroupService } from './services/group.service';
import { MembershipService } from './services/membership.service';
import { PersonController } from './controllers/person.controller';
import { GroupController } from './controllers/group.controller';
import { MembershipController } from './controllers/membership.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Person } from './entities/person.entity';
import { Group } from './entities/group.entity';
import { GroupMembership } from './entities/group-membership.entity';
import { TenantService } from '../database/tenant.service';
import { NationalIdType, GroupType } from '@perseo/shared';

describe('People Module Functional Tests', () => {
  let personController: PersonController;
  let groupController: GroupController;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    getCount: jest.fn().mockResolvedValue(0),
    getMany: jest.fn().mockResolvedValue([]),
    getOne: jest.fn().mockResolvedValue(null),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    remove: jest.fn(),
  };

  const mockTenantService = {
    getCurrentTenantId: jest.fn().mockReturnValue('test-tenant-123'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PersonController, GroupController, MembershipController],
      providers: [
        PersonService,
        GroupService,
        MembershipService,
        {
          provide: getRepositoryToken(Person),
          useValue: { ...mockRepository },
        },
        {
          provide: getRepositoryToken(Group),
          useValue: { ...mockRepository },
        },
        {
          provide: getRepositoryToken(GroupMembership),
          useValue: { ...mockRepository },
        },
        {
          provide: TenantService,
          useValue: mockTenantService,
        },
      ],
    }).compile();

    personController = module.get<PersonController>(PersonController);
    groupController = module.get<GroupController>(GroupController);

    // Reset all mocks
    jest.clearAllMocks();
    
    // Reset query builder mocks
    mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
    mockQueryBuilder.getCount.mockResolvedValue(0);
    mockQueryBuilder.getMany.mockResolvedValue([]);
    mockQueryBuilder.getOne.mockResolvedValue(null);
  });

  describe('Person Management Flow', () => {
    it('should create, read, update, and delete persons', async () => {
      const mockPerson = {
        id: 'person-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        birthDate: new Date('1990-01-01'),
        nationalId: '12345678',
        nationalIdType: NationalIdType.DNI,
        tenantId: 'test-tenant-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Test CREATE
      mockRepository.findOne.mockResolvedValue(null); // No duplicates
      mockRepository.create.mockReturnValue(mockPerson);
      mockRepository.save.mockResolvedValue(mockPerson);

      const createPersonDto = {
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
        },
        communicationPreferences: {
          email: true,
          sms: false,
          whatsapp: false,
        },
      };

      const createdPerson = await personController.create(createPersonDto);
      expect(createdPerson).toEqual(mockPerson);

      // Test READ (findAll)
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockPerson], 1]);
      
      const persons = await personController.findAll({ page: 1, limit: 10 });
      expect(persons.data).toEqual([mockPerson]);
      expect(persons.total).toBe(1);

      // Test READ (findOne)
      mockRepository.findOne.mockResolvedValue(mockPerson);
      
      const foundPerson = await personController.findOne('person-123');
      expect(foundPerson).toEqual(mockPerson);

      // Test UPDATE
      const updateDto = { firstName: 'Jane', lastName: 'Smith' };
      const updatedPerson = { ...mockPerson, ...updateDto };
      
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(updatedPerson);
      
      const result = await personController.update('person-123', updateDto);
      expect(result).toEqual(updatedPerson);

      // Test DELETE (soft delete)
      mockRepository.softDelete.mockResolvedValue({ affected: 1 });
      
      await personController.remove('person-123');
      expect(mockRepository.softDelete).toHaveBeenCalledWith({
        id: 'person-123',
        tenantId: 'test-tenant-123',
      });

      console.log('✅ Person CRUD operations test passed');
    });
  });

  describe('Group Management Flow', () => {
    it('should create and manage groups', async () => {
      const mockGroup = {
        id: 'group-123',
        name: 'Test Group',
        description: 'A test group',
        type: GroupType.ACADEMIC,
        maxMembers: 25,
        isActive: true,
        tenantId: 'test-tenant-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Test CREATE
      mockRepository.findOne.mockResolvedValue(null); // No duplicate name
      mockRepository.create.mockReturnValue(mockGroup);
      mockRepository.save.mockResolvedValue(mockGroup);

      const createGroupDto = {
        name: 'Test Group',
        description: 'A test group',
        type: GroupType.ACADEMIC,
        maxMembers: 25,
      };

      const createdGroup = await groupController.create(createGroupDto);
      expect(createdGroup).toEqual(mockGroup);

      // Test READ (findAll)
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockGroup], 1]);
      
      const groups = await groupController.findAll({ page: 1, limit: 10 });
      expect(groups.data).toEqual([mockGroup]);

      // Test hierarchy
      mockRepository.find.mockResolvedValue([mockGroup]);
      
      const hierarchy = await groupController.getHierarchy();
      expect(hierarchy).toEqual([mockGroup]);

      console.log('✅ Group management test passed');
    });
  });

  describe('Business Logic Validation', () => {
    it('should enforce email uniqueness within tenant', async () => {
      const existingPerson = {
        id: 'existing-person',
        email: 'existing@example.com',
        tenantId: 'test-tenant-123',
      };

      mockRepository.findOne.mockResolvedValue(existingPerson);

      const duplicateEmailDto = {
        firstName: 'New',
        lastName: 'Person',
        email: 'existing@example.com',
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
          name: 'Emergency Contact',
          relationship: 'Friend',
          phone: '+1234567891',
        },
        communicationPreferences: {
          email: true,
          sms: false,
          whatsapp: false,
        },
      };

      await expect(personController.create(duplicateEmailDto)).rejects.toThrow();

      console.log('✅ Email uniqueness validation test passed');
    });

    it('should enforce group name uniqueness within tenant', async () => {
      const existingGroup = {
        id: 'existing-group',
        name: 'Existing Group',
        tenantId: 'test-tenant-123',
      };

      mockRepository.findOne.mockResolvedValue(existingGroup);

      const duplicateNameDto = {
        name: 'Existing Group',
        description: 'Another group with same name',
        type: GroupType.ACADEMIC,
        maxMembers: 30,
      };

      await expect(groupController.create(duplicateNameDto)).rejects.toThrow();

      console.log('✅ Group name uniqueness validation test passed');
    });
  });

  describe('Multi-tenant Isolation', () => {
    it('should isolate data by tenant', async () => {
      const tenant1Id = 'tenant-1';

      // Test that queries include tenant filter
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue({ id: 'person-1', tenantId: tenant1Id });
      mockRepository.save.mockImplementation((data) => Promise.resolve(data));

      const personDto = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
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
          name: 'Emergency Contact',
          relationship: 'Friend',
          phone: '+1234567891',
        },
        communicationPreferences: {
          email: true,
          sms: false,
          whatsapp: false,
        },
      };

      await personController.create(personDto);

      // Verify tenant ID is included in create operation
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...personDto,
        tenantId: 'test-tenant-123',
        birthDate: new Date('1990-01-01'),
        preferredLanguage: 'es',
      });

      // Verify tenant ID is included in find operations
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: personDto.email, tenantId: 'test-tenant-123' },
      });

      console.log('✅ Multi-tenant isolation test passed');
    });
  });

  describe('API Response Validation', () => {
    it('should return properly formatted responses', async () => {
      const mockPerson = {
        id: 'person-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        tenantId: 'test-tenant-123',
      };

      // Test paginated response format
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockPerson], 1]);
      
      const response = await personController.findAll({ page: 1, limit: 10 });
      
      expect(response).toHaveProperty('data');
      expect(response).toHaveProperty('total');
      expect(response).toHaveProperty('totalPages');
      expect(Array.isArray(response.data)).toBe(true);
      expect(typeof response.total).toBe('number');
      expect(typeof response.totalPages).toBe('number');

      console.log('✅ API response format validation test passed');
    });

    it('should handle search and filtering', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await personController.findAll({ page: 1, limit: 10, search: 'John' });

      expect(mockRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();

      console.log('✅ Search and filtering test passed');
    });
  });

  describe('Error Handling', () => {
    it('should handle not found errors', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(personController.findOne('nonexistent-id')).rejects.toThrow();
      await expect(groupController.findOne('nonexistent-id')).rejects.toThrow();

      console.log('✅ Not found error handling test passed');
    });

    it('should handle database errors', async () => {
      mockRepository.save.mockRejectedValue(new Error('Database error'));
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue({});

      const personDto = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
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
          name: 'Emergency Contact',
          relationship: 'Friend',
          phone: '+1234567891',
        },
        communicationPreferences: {
          email: true,
          sms: false,
          whatsapp: false,
        },
      };

      await expect(personController.create(personDto)).rejects.toThrow('Database error');

      console.log('✅ Database error handling test passed');
    });
  });
});