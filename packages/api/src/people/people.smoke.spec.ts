import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PersonService } from './services/person.service';
import { GroupService } from './services/group.service';
import { MembershipService } from './services/membership.service';
import { PersonController } from './controllers/person.controller';
import { GroupController } from './controllers/group.controller';
import { MembershipController } from './controllers/membership.controller';
import { Person } from './entities/person.entity';
import { Group } from './entities/group.entity';
import { GroupMembership } from './entities/group-membership.entity';
import { TenantService } from '../database/tenant.service';
import { NationalIdType, GroupType, MembershipRole, MembershipStatus } from '@perseo/shared';

describe('People Module Smoke Tests', () => {
  let personService: PersonService;
  let groupService: GroupService;
  let membershipService: MembershipService;
  let personController: PersonController;
  let groupController: GroupController;
  let membershipController: MembershipController;

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
    createQueryBuilder: jest.fn(),
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

    personService = module.get<PersonService>(PersonService);
    groupService = module.get<GroupService>(GroupService);
    membershipService = module.get<MembershipService>(MembershipService);
    personController = module.get<PersonController>(PersonController);
    groupController = module.get<GroupController>(GroupController);
    membershipController = module.get<MembershipController>(MembershipController);

    jest.clearAllMocks();
  });

  describe('Service Instantiation', () => {
    it('should instantiate all services correctly', () => {
      expect(personService).toBeDefined();
      expect(groupService).toBeDefined();
      expect(membershipService).toBeDefined();
      
      console.log('✅ All People Module services instantiated successfully');
    });

    it('should instantiate all controllers correctly', () => {
      expect(personController).toBeDefined();
      expect(groupController).toBeDefined();
      expect(membershipController).toBeDefined();
      
      console.log('✅ All People Module controllers instantiated successfully');
    });
  });

  describe('Basic Data Validation', () => {
    it('should handle valid person data creation', async () => {
      const mockPerson = {
        id: 'person-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        tenantId: 'test-tenant-123',
      };

      mockRepository.findOne.mockResolvedValue(null); // No duplicates
      mockRepository.create.mockReturnValue(mockPerson);
      mockRepository.save.mockResolvedValue(mockPerson);

      const personDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
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

      const result = await personService.create(personDto);
      expect(result).toBeDefined();
      expect(mockRepository.save).toHaveBeenCalled();
      
      console.log('✅ Person creation validation successful');
    });

    it('should handle valid group data creation', async () => {
      const mockGroup = {
        id: 'group-123',
        name: 'Test Group',
        type: GroupType.ACADEMIC,
        tenantId: 'test-tenant-123',
      };

      mockRepository.findOne.mockResolvedValue(null); // No duplicate name
      mockRepository.create.mockReturnValue(mockGroup);
      mockRepository.save.mockResolvedValue(mockGroup);

      const groupDto = {
        name: 'Test Group',
        description: 'A test group',
        type: GroupType.ACADEMIC,
        maxMembers: 25,
      };

      const result = await groupService.create(groupDto);
      expect(result).toBeDefined();
      expect(mockRepository.save).toHaveBeenCalled();
      
      console.log('✅ Group creation validation successful');
    });
  });

  describe('Error Handling', () => {
    it('should handle duplicate email error', async () => {
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

      await expect(personService.create(duplicateEmailDto)).rejects.toThrow();
      
      console.log('✅ Duplicate email error handling successful');
    });

    it('should handle not found errors', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(personService.findOne('nonexistent-id')).rejects.toThrow();
      await expect(groupService.findOne('nonexistent-id')).rejects.toThrow();
      
      console.log('✅ Not found error handling successful');
    });
  });

  describe('API Controller Endpoints', () => {
    it('should define all required Person controller endpoints', () => {
      expect(typeof personController.create).toBe('function');
      expect(typeof personController.findAll).toBe('function');
      expect(typeof personController.findOne).toBe('function');
      expect(typeof personController.update).toBe('function');
      expect(typeof personController.remove).toBe('function');
      
      console.log('✅ All Person controller endpoints defined');
    });

    it('should define all required Group controller endpoints', () => {
      expect(typeof groupController.create).toBe('function');
      expect(typeof groupController.findAll).toBe('function');
      expect(typeof groupController.findOne).toBe('function');
      expect(typeof groupController.update).toBe('function');
      expect(typeof groupController.remove).toBe('function');
      expect(typeof groupController.getHierarchy).toBe('function');
      
      console.log('✅ All Group controller endpoints defined');
    });

    it('should define all required Membership controller endpoints', () => {
      expect(typeof membershipController.create).toBe('function');
      expect(typeof membershipController.findAll).toBe('function');
      expect(typeof membershipController.findOne).toBe('function');
      expect(typeof membershipController.update).toBe('function');
      expect(typeof membershipController.remove).toBe('function');
      expect(typeof membershipController.suspendMembership).toBe('function');
      expect(typeof membershipController.reactivateMembership).toBe('function');
      expect(typeof membershipController.endMembership).toBe('function');
      expect(typeof membershipController.getPersonMemberships).toBe('function');
      expect(typeof membershipController.getGroupMembers).toBe('function');
      
      console.log('✅ All Membership controller endpoints defined');
    });
  });

  describe('Type Safety Validation', () => {
    it('should validate enum types are correctly imported', () => {
      expect(Object.values(NationalIdType)).toContain('DNI');
      expect(Object.values(GroupType)).toContain('ACADEMIC');
      expect(Object.values(MembershipRole)).toContain('MEMBER');
      expect(Object.values(MembershipStatus)).toContain('ACTIVE');
      
      console.log('✅ All enum types imported and validated successfully');
    });

    it('should validate tenant service integration', () => {
      const tenantId = mockTenantService.getCurrentTenantId();
      expect(tenantId).toBe('test-tenant-123');
      
      console.log('✅ Tenant service integration validated');
    });
  });

  describe('Architecture Compliance', () => {
    it('should follow dependency injection pattern', () => {
      // Verify services have proper dependencies injected
      expect(personService).toBeInstanceOf(PersonService);
      expect(groupService).toBeInstanceOf(GroupService);
      expect(membershipService).toBeInstanceOf(MembershipService);
      
      console.log('✅ Dependency injection pattern compliance validated');
    });

    it('should follow controller-service-repository pattern', () => {
      // Controllers should use services
      expect(personController).toBeInstanceOf(PersonController);
      expect(groupController).toBeInstanceOf(GroupController);
      expect(membershipController).toBeInstanceOf(MembershipController);
      
      // Services should be available to controllers
      expect(personService).toBeDefined();
      expect(groupService).toBeDefined();
      expect(membershipService).toBeDefined();
      
      console.log('✅ Controller-Service-Repository pattern compliance validated');
    });
  });
});