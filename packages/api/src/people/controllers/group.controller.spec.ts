import { Test, TestingModule } from '@nestjs/testing';
import { GroupController } from './group.controller';
import { GroupService } from '../services/group.service';
import { CreateGroupDto, UpdateGroupDto } from '../dto/group.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('GroupController', () => {
  let controller: GroupController;
  let service: GroupService;

  const mockGroupService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getHierarchy: jest.fn(),
  };

  const mockGroup = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Group',
    description: 'A test group',
    groupType: 'COURSE',
    maxMembers: 25,
    isActive: true,
    tenantId: 'tenant-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupController],
      providers: [
        {
          provide: GroupService,
          useValue: mockGroupService,
        },
      ],
    }).compile();

    controller = module.get<GroupController>(GroupController);
    service = module.get<GroupService>(GroupService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createGroupDto: CreateGroupDto = {
      name: 'Test Group',
      description: 'A test group',
      groupType: 'COURSE',
      maxMembers: 25,
    };

    it('should create a group successfully', async () => {
      mockGroupService.create.mockResolvedValue(mockGroup);

      const result = await controller.create(createGroupDto);

      expect(service.create).toHaveBeenCalledWith(createGroupDto);
      expect(result).toEqual(mockGroup);
    });

    it('should handle creation errors', async () => {
      mockGroupService.create.mockRejectedValue(
        new ConflictException('Group name already exists'),
      );

      await expect(controller.create(createGroupDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated groups', async () => {
      const paginatedResult = {
        data: [mockGroup],
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
      };
      mockGroupService.findAll.mockResolvedValue(paginatedResult);

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
        data: [mockGroup],
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
      };
      mockGroupService.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll({
        page: 1,
        limit: 10,
        search: 'Test',
      });

      expect(service.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: 'Test',
      });
      expect(result).toEqual(paginatedResult);
    });

  });

  describe('findOne', () => {
    it('should return a group by id', async () => {
      mockGroupService.findOne.mockResolvedValue(mockGroup);

      const result = await controller.findOne('123e4567-e89b-12d3-a456-426614174000');

      expect(service.findOne).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
      expect(result).toEqual(mockGroup);
    });

    it('should handle group not found', async () => {
      mockGroupService.findOne.mockRejectedValue(
        new NotFoundException('Group not found'),
      );

      await expect(
        controller.findOne('nonexistent-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateGroupDto: UpdateGroupDto = {
      name: 'Updated Group',
      description: 'Updated description',
    };

    it('should update a group successfully', async () => {
      const updatedGroup = { ...mockGroup, ...updateGroupDto };
      mockGroupService.update.mockResolvedValue(updatedGroup);

      const result = await controller.update(
        '123e4567-e89b-12d3-a456-426614174000',
        updateGroupDto,
      );

      expect(service.update).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000',
        updateGroupDto,
      );
      expect(result).toEqual(updatedGroup);
    });

    it('should handle update errors', async () => {
      mockGroupService.update.mockRejectedValue(
        new NotFoundException('Group not found'),
      );

      await expect(
        controller.update('nonexistent-id', updateGroupDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a group successfully', async () => {
      mockGroupService.remove.mockResolvedValue(undefined);

      await controller.remove('123e4567-e89b-12d3-a456-426614174000');

      expect(service.remove).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should handle deletion errors', async () => {
      mockGroupService.remove.mockRejectedValue(
        new NotFoundException('Group not found'),
      );

      await expect(
        controller.remove('nonexistent-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getHierarchy', () => {
    it('should return root groups when no parentId provided', async () => {
      const groups = [mockGroup];
      mockGroupService.getHierarchy.mockResolvedValue(groups);

      const result = await controller.getHierarchy(undefined);

      expect(service.getHierarchy).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(groups);
    });

    it('should return children of specific parent', async () => {
      const groups = [mockGroup];
      mockGroupService.getHierarchy.mockResolvedValue(groups);

      const result = await controller.getHierarchy('parent-id');

      expect(service.getHierarchy).toHaveBeenCalledWith('parent-id');
      expect(result).toEqual(groups);
    });
  });

});