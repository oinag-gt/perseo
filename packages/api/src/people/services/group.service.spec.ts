import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { GroupService } from './group.service';
import { Group } from '../entities/group.entity';
import { TenantService } from '../../database/tenant.service';
import { CreateGroupDto } from '../dto/create-group.dto';
import { UpdateGroupDto } from '../dto/update-group.dto';
import { GroupType } from '@perseo/shared';

describe('GroupService', () => {
  let service: GroupService;
  let repository: Repository<Group>;
  let tenantService: TenantService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockTenantService = {
    getCurrentTenantId: jest.fn(),
  };

  const mockGroup: Partial<Group> = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Group',
    description: 'A test group',
    type: GroupType.COURSE,
    maxMembers: 25,
    isActive: true,
    tenantId: 'tenant-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockParentGroup: Partial<Group> = {
    id: '223e4567-e89b-12d3-a456-426614174000',
    name: 'Parent Group',
    description: 'A parent group',
    type: GroupType.DEPARTMENT,
    maxMembers: 100,
    isActive: true,
    tenantId: 'tenant-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupService,
        {
          provide: getRepositoryToken(Group),
          useValue: mockRepository,
        },
        {
          provide: TenantService,
          useValue: mockTenantService,
        },
      ],
    }).compile();

    service = module.get<GroupService>(GroupService);
    repository = module.get<Repository<Group>>(getRepositoryToken(Group));
    tenantService = module.get<TenantService>(TenantService);

    // Reset mocks before each test
    jest.clearAllMocks();
    mockTenantService.getCurrentTenantId.mockReturnValue('tenant-123');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createGroupDto: CreateGroupDto = {
      name: 'Test Group',
      description: 'A test group',
      type: GroupType.COURSE,
      maxMembers: 25,
    };

    it('should create a group successfully', async () => {
      mockRepository.findOne.mockResolvedValue(null); // No duplicate name
      mockRepository.create.mockReturnValue(mockGroup);
      mockRepository.save.mockResolvedValue(mockGroup);

      const result = await service.create(createGroupDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { name: createGroupDto.name, tenantId: 'tenant-123' },
      });
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createGroupDto,
        tenantId: 'tenant-123',
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockGroup);
      expect(result).toEqual(mockGroup);
    });

    it('should create a group with parent successfully', async () => {
      const createGroupWithParentDto = { ...createGroupDto, parentGroupId: mockParentGroup.id };
      
      mockRepository.findOne
        .mockResolvedValueOnce(null) // No duplicate name
        .mockResolvedValueOnce(mockParentGroup); // Parent exists
      mockRepository.create.mockReturnValue({ ...mockGroup, parent: mockParentGroup });
      mockRepository.save.mockResolvedValue({ ...mockGroup, parent: mockParentGroup });

      const result = await service.create(createGroupWithParentDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockParentGroup.id, tenantId: 'tenant-123' },
      });
      expect(result.parent).toEqual(mockParentGroup);
    });

    it('should throw ConflictException if group name already exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockGroup);

      await expect(service.create(createGroupDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw NotFoundException if parent group not found', async () => {
      const createGroupWithParentDto = { ...createGroupDto, parentGroupId: 'nonexistent-id' };
      
      mockRepository.findOne
        .mockResolvedValueOnce(null) // No duplicate name
        .mockResolvedValueOnce(null); // Parent doesn't exist

      await expect(service.create(createGroupWithParentDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated groups', async () => {
      const groups = [mockGroup];
      mockRepository.findAndCount.mockResolvedValue([groups, 1]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-123' },
        relations: ['parent', 'children', 'leader'],
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual({
        data: groups,
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
      });
    });

    it('should search groups by name', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockGroup], 1]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll({ page: 1, limit: 10, search: 'Test' });

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('group');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('group.tenantId = :tenantId', {
        tenantId: 'tenant-123',
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
      expect(result.data).toEqual([mockGroup]);
    });
  });

  describe('findOne', () => {
    it('should return a group by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockGroup);

      const result = await service.findOne('123e4567-e89b-12d3-a456-426614174000');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '123e4567-e89b-12d3-a456-426614174000', tenantId: 'tenant-123' },
        relations: ['parent', 'children', 'leader', 'memberships', 'memberships.person'],
      });
      expect(result).toEqual(mockGroup);
    });

    it('should throw NotFoundException if group not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateGroupDto: UpdateGroupDto = {
      name: 'Updated Group',
      description: 'Updated description',
    };

    it('should update a group successfully', async () => {
      mockRepository.findOne.mockResolvedValue(mockGroup);
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValueOnce(mockGroup).mockResolvedValueOnce({
        ...mockGroup,
        ...updateGroupDto,
      });

      const result = await service.update('123e4567-e89b-12d3-a456-426614174000', updateGroupDto);

      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: '123e4567-e89b-12d3-a456-426614174000', tenantId: 'tenant-123' },
        updateGroupDto,
      );
      expect(result).toEqual({ ...mockGroup, ...updateGroupDto });
    });

    it('should throw NotFoundException if group not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('nonexistent-id', updateGroupDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should prevent circular parent relationship', async () => {
      const updateWithParent = { parentId: '123e4567-e89b-12d3-a456-426614174000' }; // Self as parent
      mockRepository.findOne.mockResolvedValue(mockGroup);

      await expect(
        service.update('123e4567-e89b-12d3-a456-426614174000', updateWithParent),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should soft delete a group successfully', async () => {
      const groupWithNoChildren = { ...mockGroup, children: [] };
      mockRepository.findOne.mockResolvedValue(groupWithNoChildren);
      mockRepository.softDelete.mockResolvedValue({ affected: 1 });

      await service.remove('123e4567-e89b-12d3-a456-426614174000');

      expect(mockRepository.softDelete).toHaveBeenCalledWith({
        id: '123e4567-e89b-12d3-a456-426614174000',
        tenantId: 'tenant-123',
      });
    });

    it('should throw BadRequestException if group has children', async () => {
      const groupWithChildren = { ...mockGroup, children: [mockParentGroup] };
      mockRepository.findOne.mockResolvedValue(groupWithChildren);

      await expect(service.remove('123e4567-e89b-12d3-a456-426614174000')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if group not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getHierarchy', () => {
    it('should return root groups when no parentId provided', async () => {
      const rootGroups = [mockGroup];
      mockRepository.find.mockResolvedValue(rootGroups);

      const result = await service.getHierarchy();

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-123', parent: { id: null } },
        relations: ['children', 'leader'],
        order: { name: 'ASC' },
      });
      expect(result).toEqual(rootGroups);
    });

    it('should return children of specific parent', async () => {
      const childGroups = [mockGroup];
      mockRepository.find.mockResolvedValue(childGroups);

      const result = await service.getHierarchy(mockParentGroup.id);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-123', parent: { id: mockParentGroup.id } },
        relations: ['children', 'leader'],
        order: { name: 'ASC' },
      });
      expect(result).toEqual(childGroups);
    });
  });

  describe('validateGroupCapacity', () => {
    it('should return true when group has capacity', async () => {
      const groupWithMembers = { 
        ...mockGroup, 
        maxMembers: 25,
        memberships: new Array(20).fill({}) // 20 current members
      };
      mockRepository.findOne.mockResolvedValue(groupWithMembers);

      const result = await service.validateGroupCapacity('123e4567-e89b-12d3-a456-426614174000', 3);

      expect(result).toBe(true);
    });

    it('should return false when group is at capacity', async () => {
      const groupWithMembers = { 
        ...mockGroup, 
        maxMembers: 25,
        memberships: new Array(25).fill({}) // 25 current members (at capacity)
      };
      mockRepository.findOne.mockResolvedValue(groupWithMembers);

      const result = await service.validateGroupCapacity('123e4567-e89b-12d3-a456-426614174000', 1);

      expect(result).toBe(false);
    });

    it('should return true when group has no member limit', async () => {
      const groupWithoutLimit = { 
        ...mockGroup, 
        maxMembers: null,
        memberships: new Array(100).fill({}) // Many members
      };
      mockRepository.findOne.mockResolvedValue(groupWithoutLimit);

      const result = await service.validateGroupCapacity('123e4567-e89b-12d3-a456-426614174000', 10);

      expect(result).toBe(true);
    });
  });
});