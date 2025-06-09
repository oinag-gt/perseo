import { Test, TestingModule } from '@nestjs/testing';
import { MembershipController } from './membership.controller';
import { MembershipService } from '../services/membership.service';
import { CreateMembershipDto, UpdateMembershipDto } from '../dto/membership.dto';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { MembershipStatus, MembershipRole } from '../entities/group-membership.entity';

describe('MembershipController', () => {
  let controller: MembershipController;
  let service: MembershipService;

  const mockMembershipService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    endMembership: jest.fn(),
    suspendMembership: jest.fn(),
    reactivateMembership: jest.fn(),
    getPersonMemberships: jest.fn(),
  };

  const mockMembership = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    personId: 'person-123',
    groupId: 'group-123',
    role: MembershipRole.MEMBER,
    status: MembershipStatus.ACTIVE,
    startDate: new Date('2024-01-01'),
    tenantId: 'tenant-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    person: {
      id: 'person-123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
    },
    group: {
      id: 'group-123',
      name: 'Test Group',
      groupType: 'COURSE',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MembershipController],
      providers: [
        {
          provide: MembershipService,
          useValue: mockMembershipService,
        },
      ],
    }).compile();

    controller = module.get<MembershipController>(MembershipController);
    service = module.get<MembershipService>(MembershipService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createMembershipDto: CreateMembershipDto = {
      personId: 'person-123',
      groupId: 'group-123',
      role: MembershipRole.MEMBER,
      startDate: new Date('2024-01-01'),
    };

    it('should create a membership successfully', async () => {
      mockMembershipService.create.mockResolvedValue(mockMembership);

      const result = await controller.create(createMembershipDto, { id: 'test-user-id' } as any);

      expect(service.create).toHaveBeenCalledWith(createMembershipDto);
      expect(result).toEqual(mockMembership);
    });

    it('should handle creation errors', async () => {
      mockMembershipService.create.mockRejectedValue(
        new ConflictException('Membership already exists'),
      );

      await expect(controller.create(createMembershipDto, { id: 'test-user-id' } as any)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should handle capacity errors', async () => {
      mockMembershipService.create.mockRejectedValue(
        new BadRequestException('Group is at capacity'),
      );

      await expect(controller.create(createMembershipDto, { id: 'test-user-id' } as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated memberships', async () => {
      const paginatedResult = {
        data: [mockMembership],
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
      };
      mockMembershipService.findAll.mockResolvedValue(paginatedResult);

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

    it('should filter by group', async () => {
      const paginatedResult = {
        data: [mockMembership],
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
      };
      mockMembershipService.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll({
        page: 1,
        limit: 10,
        groupId: 'group-123',
      });

      expect(service.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        groupId: 'group-123',
      });
      expect(result).toEqual(paginatedResult);
    });

    it('should filter by person', async () => {
      const paginatedResult = {
        data: [mockMembership],
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
      };
      mockMembershipService.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll({
        page: 1,
        limit: 10,
        personId: 'person-123',
      });

      expect(service.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        personId: 'person-123',
      });
      expect(result).toEqual(paginatedResult);
    });

    it('should filter by status', async () => {
      const paginatedResult = {
        data: [mockMembership],
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
      };
      mockMembershipService.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll({
        page: 1,
        limit: 10,
        status: MembershipStatus.ACTIVE,
      });

      expect(service.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        status: MembershipStatus.ACTIVE,
      });
      expect(result).toEqual(paginatedResult);
    });
  });

  describe('findOne', () => {
    it('should return a membership by id', async () => {
      mockMembershipService.findOne.mockResolvedValue(mockMembership);

      const result = await controller.findOne('123e4567-e89b-12d3-a456-426614174000');

      expect(service.findOne).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
      expect(result).toEqual(mockMembership);
    });

    it('should handle membership not found', async () => {
      mockMembershipService.findOne.mockRejectedValue(
        new NotFoundException('Membership not found'),
      );

      await expect(
        controller.findOne('nonexistent-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateMembershipDto: UpdateMembershipDto = {
      role: MembershipRole.LEADER,
      notes: 'Promoted to leader',
    };

    it('should update a membership successfully', async () => {
      const updatedMembership = { ...mockMembership, ...updateMembershipDto };
      mockMembershipService.update.mockResolvedValue(updatedMembership);

      const result = await controller.update(
        '123e4567-e89b-12d3-a456-426614174000',
        updateMembershipDto,
      );

      expect(service.update).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000',
        updateMembershipDto,
      );
      expect(result).toEqual(updatedMembership);
    });

    it('should handle update errors', async () => {
      mockMembershipService.update.mockRejectedValue(
        new NotFoundException('Membership not found'),
      );

      await expect(
        controller.update('nonexistent-id', updateMembershipDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a membership successfully', async () => {
      mockMembershipService.remove.mockResolvedValue(undefined);

      await controller.remove('123e4567-e89b-12d3-a456-426614174000');

      expect(service.remove).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should handle deletion errors', async () => {
      mockMembershipService.remove.mockRejectedValue(
        new NotFoundException('Membership not found'),
      );

      await expect(
        controller.remove('nonexistent-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('endMembership', () => {
    it('should end a membership successfully', async () => {
      const endedMembership = {
        ...mockMembership,
        status: MembershipStatus.INACTIVE,
        endDate: new Date('2024-12-31'),
      };
      mockMembershipService.endMembership.mockResolvedValue(endedMembership);

      const result = await controller.endMembership(
        '123e4567-e89b-12d3-a456-426614174000',
        { endDate: new Date('2024-12-31'), reason: 'Completed course' },
      );

      expect(service.endMembership).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000',
        new Date('2024-12-31'),
        'Completed course',
      );
      expect(result).toEqual(endedMembership);
    });

    it('should handle end membership errors', async () => {
      mockMembershipService.endMembership.mockRejectedValue(
        new BadRequestException('Membership is not active'),
      );

      await expect(
        controller.endMembership('123e4567-e89b-12d3-a456-426614174000', {
          endDate: new Date('2024-12-31'),
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('suspendMembership', () => {
    it('should suspend a membership successfully', async () => {
      const suspendedMembership = {
        ...mockMembership,
        status: MembershipStatus.SUSPENDED,
      };
      mockMembershipService.suspendMembership.mockResolvedValue(suspendedMembership);

      const result = await controller.suspendMembership(
        '123e4567-e89b-12d3-a456-426614174000',
        { reason: 'Disciplinary action' },
      );

      expect(service.suspendMembership).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000',
        'Disciplinary action',
      );
      expect(result).toEqual(suspendedMembership);
    });

    it('should handle suspend membership errors', async () => {
      mockMembershipService.suspendMembership.mockRejectedValue(
        new BadRequestException('Membership is not active'),
      );

      await expect(
        controller.suspendMembership('123e4567-e89b-12d3-a456-426614174000', {
          reason: 'Disciplinary action',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('reactivateMembership', () => {
    it('should reactivate a membership successfully', async () => {
      const reactivatedMembership = {
        ...mockMembership,
        status: MembershipStatus.ACTIVE,
      };
      mockMembershipService.reactivateMembership.mockResolvedValue(reactivatedMembership);

      const result = await controller.reactivateMembership('123e4567-e89b-12d3-a456-426614174000');

      expect(service.reactivateMembership).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
      expect(result).toEqual(reactivatedMembership);
    });

    it('should handle reactivate membership errors', async () => {
      mockMembershipService.reactivateMembership.mockRejectedValue(
        new BadRequestException('Membership is not suspended'),
      );

      await expect(
        controller.reactivateMembership('123e4567-e89b-12d3-a456-426614174000'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getPersonMemberships', () => {
    it('should return all memberships for a person', async () => {
      const memberships = [mockMembership];
      mockMembershipService.getPersonMemberships.mockResolvedValue(memberships);

      const result = await controller.getPersonMemberships('person-123');

      expect(service.getPersonMemberships).toHaveBeenCalledWith('person-123');
      expect(result).toEqual(memberships);
    });

    it('should handle person not found', async () => {
      mockMembershipService.getPersonMemberships.mockRejectedValue(
        new NotFoundException('Person not found'),
      );

      await expect(
        controller.getPersonMemberships('nonexistent-person'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});