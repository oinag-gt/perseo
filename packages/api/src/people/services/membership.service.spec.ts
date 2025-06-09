import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { MembershipService } from './membership.service';
import { GroupMembership } from '../entities/group-membership.entity';
import { GroupService } from './group.service';
import { PersonService } from './person.service';
import { TenantService } from '../../database/tenant.service';
import { CreateMembershipDto } from '../dto/create-membership.dto';
import { UpdateMembershipDto } from '../dto/update-membership.dto';
import { MembershipStatus, MembershipRole } from '../entities/group-membership.entity';

describe('MembershipService', () => {
  let service: MembershipService;
  let repository: Repository<GroupMembership>;
  let groupService: GroupService;
  let personService: PersonService;
  let tenantService: TenantService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockGroupService = {
    findOne: jest.fn(),
    validateGroupCapacity: jest.fn(),
  };

  const mockPersonService = {
    findOne: jest.fn(),
  };

  const mockTenantService = {
    getCurrentTenantId: jest.fn(),
  };

  const mockMembership: Partial<GroupMembership> = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    personId: 'person-123',
    groupId: 'group-123',
    role: MembershipRole.MEMBER,
    status: MembershipStatus.ACTIVE,
    startDate: new Date('2024-01-01'),
    tenantId: 'tenant-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPerson = {
    id: 'person-123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
  };

  const mockGroup = {
    id: 'group-123',
    name: 'Test Group',
    groupType: 'COURSE',
    maxMembers: 25,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembershipService,
        {
          provide: getRepositoryToken(GroupMembership),
          useValue: mockRepository,
        },
        {
          provide: GroupService,
          useValue: mockGroupService,
        },
        {
          provide: PersonService,
          useValue: mockPersonService,
        },
        {
          provide: TenantService,
          useValue: mockTenantService,
        },
      ],
    }).compile();

    service = module.get<MembershipService>(MembershipService);
    repository = module.get<Repository<GroupMembership>>(getRepositoryToken(GroupMembership));
    groupService = module.get<GroupService>(GroupService);
    personService = module.get<PersonService>(PersonService);
    tenantService = module.get<TenantService>(TenantService);

    // Reset mocks before each test
    jest.clearAllMocks();
    mockTenantService.getCurrentTenantId.mockReturnValue('tenant-123');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createMembershipDto: CreateMembershipDto = {
      personId: 'person-123',
      groupId: 'group-123',
      role: MembershipRole.MEMBER,
      startDate: '2024-01-01',
    };

    beforeEach(() => {
      mockPersonService.findOne.mockResolvedValue(mockPerson);
      mockGroupService.findOne.mockResolvedValue(mockGroup);
      mockGroupService.validateGroupCapacity.mockResolvedValue(true);
    });

    it('should create a membership successfully', async () => {
      mockRepository.findOne.mockResolvedValue(null); // No existing membership
      mockRepository.create.mockReturnValue(mockMembership);
      mockRepository.save.mockResolvedValue(mockMembership);

      const result = await service.create(createMembershipDto, 'test-user-id');

      expect(mockPersonService.findOne).toHaveBeenCalledWith('person-123');
      expect(mockGroupService.findOne).toHaveBeenCalledWith('group-123');
      expect(mockGroupService.validateGroupCapacity).toHaveBeenCalledWith('group-123', 1);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: {
          personId: 'person-123',
          groupId: 'group-123',
          tenantId: 'tenant-123',
        },
      });
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createMembershipDto,
        tenantId: 'tenant-123',
        status: MembershipStatus.ACTIVE,
      });
      expect(result).toEqual(mockMembership);
    });

    it('should throw NotFoundException if person not found', async () => {
      mockPersonService.findOne.mockRejectedValue(new NotFoundException());

      await expect(service.create(createMembershipDto, 'test-user-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if group not found', async () => {
      mockGroupService.findOne.mockRejectedValue(new NotFoundException());

      await expect(service.create(createMembershipDto, 'test-user-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if group is at capacity', async () => {
      mockGroupService.validateGroupCapacity.mockResolvedValue(false);

      await expect(service.create(createMembershipDto, 'test-user-id')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException if membership already exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockMembership);

      await expect(service.create(createMembershipDto, 'test-user-id')).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw BadRequestException for overlapping membership dates', async () => {
      const overlappingMembership = {
        ...mockMembership,
        startDate: new Date('2023-06-01'),
        endDate: new Date('2024-06-01'), // Overlaps with new start date
      };
      
      mockRepository.findOne.mockResolvedValue(null); // No exact match
      
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(overlappingMembership),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(service.create(createMembershipDto, 'test-user-id')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated memberships', async () => {
      const memberships = [mockMembership];
      mockRepository.findAndCount.mockResolvedValue([memberships, 1]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-123' },
        relations: ['person', 'group'],
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual({
        data: memberships,
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
      });
    });

    it('should filter by group', async () => {
      const memberships = [mockMembership];
      mockRepository.findAndCount.mockResolvedValue([memberships, 1]);

      const result = await service.findAll({ page: 1, limit: 10, groupId: 'group-123' });

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-123', groupId: 'group-123' },
        relations: ['person', 'group'],
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
      });
      expect(result.data).toEqual(memberships);
    });

    it('should filter by person', async () => {
      const memberships = [mockMembership];
      mockRepository.findAndCount.mockResolvedValue([memberships, 1]);

      const result = await service.findAll({ page: 1, limit: 10, personId: 'person-123' });

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-123', personId: 'person-123' },
        relations: ['person', 'group'],
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
      });
      expect(result.data).toEqual(memberships);
    });

    it('should filter by status', async () => {
      const memberships = [mockMembership];
      mockRepository.findAndCount.mockResolvedValue([memberships, 1]);

      const result = await service.findAll({ 
        page: 1, 
        limit: 10, 
        status: MembershipStatus.ACTIVE 
      });

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-123', status: MembershipStatus.ACTIVE },
        relations: ['person', 'group'],
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
      });
      expect(result.data).toEqual(memberships);
    });
  });

  describe('findOne', () => {
    it('should return a membership by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockMembership);

      const result = await service.findOne('123e4567-e89b-12d3-a456-426614174000');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '123e4567-e89b-12d3-a456-426614174000', tenantId: 'tenant-123' },
        relations: ['person', 'group'],
      });
      expect(result).toEqual(mockMembership);
    });

    it('should throw NotFoundException if membership not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateMembershipDto: UpdateMembershipDto = {
      role: MembershipRole.LEADER,
      notes: 'Promoted to leader',
    };

    it('should update a membership successfully', async () => {
      mockRepository.findOne.mockResolvedValue(mockMembership);
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValueOnce(mockMembership).mockResolvedValueOnce({
        ...mockMembership,
        ...updateMembershipDto,
      });

      const result = await service.update('123e4567-e89b-12d3-a456-426614174000', updateMembershipDto);

      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: '123e4567-e89b-12d3-a456-426614174000', tenantId: 'tenant-123' },
        updateMembershipDto,
      );
      expect(result).toEqual({ ...mockMembership, ...updateMembershipDto });
    });

    it('should throw NotFoundException if membership not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('nonexistent-id', updateMembershipDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a membership successfully', async () => {
      mockRepository.findOne.mockResolvedValue(mockMembership);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove('123e4567-e89b-12d3-a456-426614174000');

      expect(mockRepository.delete).toHaveBeenCalledWith({
        id: '123e4567-e89b-12d3-a456-426614174000',
        tenantId: 'tenant-123',
      });
    });

    it('should throw NotFoundException if membership not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('endMembership', () => {
    it('should end a membership successfully', async () => {
      const activeMembership = { ...mockMembership, status: MembershipStatus.ACTIVE };
      mockRepository.findOne.mockResolvedValue(activeMembership);
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValueOnce(activeMembership).mockResolvedValueOnce({
        ...activeMembership,
        status: MembershipStatus.INACTIVE,
        endDate: new Date('2024-12-31'),
      });

      const result = await service.endMembership(
        '123e4567-e89b-12d3-a456-426614174000',
        new Date('2024-12-31'),
        'Completed course',
      );

      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: '123e4567-e89b-12d3-a456-426614174000', tenantId: 'tenant-123' },
        {
          status: MembershipStatus.INACTIVE,
          endDate: new Date('2024-12-31'),
          reason: 'Completed course',
        },
      );
      expect(result.status).toBe(MembershipStatus.INACTIVE);
    });

    it('should throw BadRequestException if membership is not active', async () => {
      const inactiveMembership = { ...mockMembership, status: MembershipStatus.INACTIVE };
      mockRepository.findOne.mockResolvedValue(inactiveMembership);

      await expect(
        service.endMembership(
          '123e4567-e89b-12d3-a456-426614174000',
          new Date('2024-12-31'),
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('suspendMembership', () => {
    it('should suspend a membership successfully', async () => {
      const activeMembership = { ...mockMembership, status: MembershipStatus.ACTIVE };
      mockRepository.findOne.mockResolvedValue(activeMembership);
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValueOnce(activeMembership).mockResolvedValueOnce({
        ...activeMembership,
        status: MembershipStatus.SUSPENDED,
      });

      const result = await service.suspendMembership(
        '123e4567-e89b-12d3-a456-426614174000',
        'Disciplinary action',
      );

      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: '123e4567-e89b-12d3-a456-426614174000', tenantId: 'tenant-123' },
        {
          status: MembershipStatus.SUSPENDED,
          reason: 'Disciplinary action',
        },
      );
      expect(result.status).toBe(MembershipStatus.SUSPENDED);
    });
  });

  describe('reactivateMembership', () => {
    it('should reactivate a suspended membership successfully', async () => {
      const suspendedMembership = { ...mockMembership, status: MembershipStatus.SUSPENDED };
      mockRepository.findOne.mockResolvedValue(suspendedMembership);
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValueOnce(suspendedMembership).mockResolvedValueOnce({
        ...suspendedMembership,
        status: MembershipStatus.ACTIVE,
      });

      const result = await service.reactivateMembership('123e4567-e89b-12d3-a456-426614174000');

      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: '123e4567-e89b-12d3-a456-426614174000', tenantId: 'tenant-123' },
        { status: MembershipStatus.ACTIVE },
      );
      expect(result.status).toBe(MembershipStatus.ACTIVE);
    });

    it('should throw BadRequestException if membership is not suspended', async () => {
      const activeMembership = { ...mockMembership, status: MembershipStatus.ACTIVE };
      mockRepository.findOne.mockResolvedValue(activeMembership);

      await expect(
        service.reactivateMembership('123e4567-e89b-12d3-a456-426614174000'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getPersonMemberships', () => {
    it('should return all memberships for a person', async () => {
      const memberships = [mockMembership];
      mockRepository.find.mockResolvedValue(memberships);

      const result = await service.getPersonMemberships('person-123');

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { personId: 'person-123', tenantId: 'tenant-123' },
        relations: ['group'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(memberships);
    });
  });
});