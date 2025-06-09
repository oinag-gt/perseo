import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupMembership, MembershipStatus, MembershipRole } from '../entities/group-membership.entity';
import { CreateMembershipDto } from '../dto/create-membership.dto';
import { UpdateMembershipDto } from '../dto/update-membership.dto';
import { PersonService } from './person.service';
import { GroupService } from './group.service';

interface MembershipQueryParams {
  page?: number;
  limit?: number;
  personId?: string;
  groupId?: string;
  role?: string;
  status?: string;
  startDateAfter?: string;
  startDateBefore?: string;
  endDateAfter?: string;
  endDateBefore?: string;
  addedBy?: string;
}

@Injectable()
export class MembershipService {
  constructor(
    @InjectRepository(GroupMembership)
    private readonly membershipRepository: Repository<GroupMembership>,
    private readonly personService: PersonService,
    private readonly groupService: GroupService,
  ) {}

  async create(createMembershipDto: CreateMembershipDto, addedBy: string): Promise<GroupMembership> {
    // Validate person exists
    await this.personService.findOne(createMembershipDto.personId);
    
    // Validate group exists
    const group = await this.groupService.findOne(createMembershipDto.groupId);

    // Check if group is at capacity
    if (group.maxMembers) {
      const currentMemberCount = await this.membershipRepository.count({
        where: {
          groupId: createMembershipDto.groupId,
          status: MembershipStatus.ACTIVE,
          endDate: null,
        },
      });

      if (currentMemberCount >= group.maxMembers) {
        throw new BadRequestException('Group is at maximum capacity');
      }
    }

    // Check for overlapping active membership
    const overlappingMembership = await this.membershipRepository
      .createQueryBuilder('membership')
      .where('membership.personId = :personId', { personId: createMembershipDto.personId })
      .andWhere('membership.groupId = :groupId', { groupId: createMembershipDto.groupId })
      .andWhere('membership.status = :status', { status: MembershipStatus.ACTIVE })
      .andWhere('membership.startDate <= :startDate', { startDate: createMembershipDto.startDate })
      .andWhere('(membership.endDate IS NULL OR membership.endDate >= :startDate)', { startDate: createMembershipDto.startDate })
      .getOne();

    if (overlappingMembership) {
      throw new ConflictException('Person already has an active membership in this group during the specified period');
    }

    // Validate dates
    if (createMembershipDto.endDate) {
      const startDate = new Date(createMembershipDto.startDate);
      const endDate = new Date(createMembershipDto.endDate);
      if (endDate <= startDate) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    const membership = this.membershipRepository.create({
      personId: createMembershipDto.personId,
      groupId: createMembershipDto.groupId,
      startDate: new Date(createMembershipDto.startDate),
      endDate: createMembershipDto.endDate ? new Date(createMembershipDto.endDate) : null,
      role: createMembershipDto.role || MembershipRole.MEMBER,
      status: createMembershipDto.status || MembershipStatus.ACTIVE,
      reason: createMembershipDto.reason,
      addedBy,
    });

    return this.membershipRepository.save(membership);
  }

  async findAll(query: MembershipQueryParams): Promise<{ data: GroupMembership[]; total: number; totalPages: number }> {
    const { page = 1, limit = 20, personId, groupId, role, status, startDateAfter, startDateBefore, endDateAfter, endDateBefore, addedBy } = query;

    const queryBuilder = this.membershipRepository.createQueryBuilder('membership')
      .leftJoinAndSelect('membership.person', 'person')
      .leftJoinAndSelect('membership.group', 'group')
      .leftJoinAndSelect('membership.addedByUser', 'addedByUser');

    if (personId) {
      queryBuilder.andWhere('membership.personId = :personId', { personId });
    }

    if (groupId) {
      queryBuilder.andWhere('membership.groupId = :groupId', { groupId });
    }

    if (role) {
      queryBuilder.andWhere('membership.role = :role', { role });
    }

    if (status) {
      queryBuilder.andWhere('membership.status = :status', { status });
    }

    if (startDateAfter) {
      queryBuilder.andWhere('membership.startDate >= :startDateAfter', { startDateAfter });
    }

    if (startDateBefore) {
      queryBuilder.andWhere('membership.startDate <= :startDateBefore', { startDateBefore });
    }

    if (endDateAfter) {
      queryBuilder.andWhere('membership.endDate >= :endDateAfter', { endDateAfter });
    }

    if (endDateBefore) {
      queryBuilder.andWhere('membership.endDate <= :endDateBefore', { endDateBefore });
    }

    if (addedBy) {
      queryBuilder.andWhere('membership.addedBy = :addedBy', { addedBy });
    }

    const total = await queryBuilder.getCount();
    const totalPages = Math.ceil(total / limit);

    const data = await queryBuilder
      .orderBy('membership.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total, totalPages };
  }

  async findOne(id: string): Promise<GroupMembership> {
    const membership = await this.membershipRepository.findOne({
      where: { id },
      relations: ['person', 'group', 'addedByUser'],
    });

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    return membership;
  }

  async update(id: string, updateMembershipDto: UpdateMembershipDto): Promise<GroupMembership> {
    const membership = await this.findOne(id);

    // Validate dates if being updated
    const startDate = updateMembershipDto.startDate ? new Date(updateMembershipDto.startDate) : membership.startDate;
    const endDate = updateMembershipDto.endDate ? new Date(updateMembershipDto.endDate) : membership.endDate;

    if (endDate && endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Check for overlapping memberships if person or group is being changed
    if (updateMembershipDto.personId || updateMembershipDto.groupId) {
      const personId = updateMembershipDto.personId || membership.personId;
      const groupId = updateMembershipDto.groupId || membership.groupId;

      if (personId !== membership.personId || groupId !== membership.groupId) {
        // Validate new person/group exists
        if (personId !== membership.personId) {
          await this.personService.findOne(personId);
        }
        if (groupId !== membership.groupId) {
          await this.groupService.findOne(groupId);
        }

        // Check for overlapping membership
        const overlappingMembership = await this.membershipRepository
          .createQueryBuilder('membership')
          .where('membership.id != :currentId', { currentId: id })
          .andWhere('membership.personId = :personId', { personId })
          .andWhere('membership.groupId = :groupId', { groupId })
          .andWhere('membership.status = :status', { status: MembershipStatus.ACTIVE })
          .andWhere('membership.startDate <= :startDate', { startDate })
          .andWhere('(membership.endDate IS NULL OR membership.endDate >= :startDate)', { startDate })
          .getOne();

        if (overlappingMembership) {
          throw new ConflictException('Person already has an active membership in this group during the specified period');
        }
      }
    }

    // Update fields
    if (updateMembershipDto.startDate) {
      membership.startDate = new Date(updateMembershipDto.startDate);
    }
    if (updateMembershipDto.endDate) {
      membership.endDate = new Date(updateMembershipDto.endDate);
    }
    if (updateMembershipDto.role) {
      membership.role = updateMembershipDto.role;
    }
    if (updateMembershipDto.status) {
      membership.status = updateMembershipDto.status;
    }
    if (updateMembershipDto.reason !== undefined) {
      membership.reason = updateMembershipDto.reason;
    }

    return this.membershipRepository.save(membership);
  }

  async remove(id: string): Promise<void> {
    const membership = await this.findOne(id);
    await this.membershipRepository.remove(membership);
  }

  async endMembership(id: string, endDate: Date, reason?: string): Promise<GroupMembership> {
    const membership = await this.findOne(id);

    if (endDate <= membership.startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    membership.endDate = endDate;
    membership.status = MembershipStatus.INACTIVE;
    if (reason) {
      membership.reason = reason;
    }

    return this.membershipRepository.save(membership);
  }

  async suspendMembership(id: string, reason: string): Promise<GroupMembership> {
    const membership = await this.findOne(id);
    
    membership.status = MembershipStatus.SUSPENDED;
    membership.reason = reason;

    return this.membershipRepository.save(membership);
  }

  async reactivateMembership(id: string): Promise<GroupMembership> {
    const membership = await this.findOne(id);
    
    if (membership.status !== MembershipStatus.SUSPENDED) {
      throw new BadRequestException('Only suspended memberships can be reactivated');
    }

    membership.status = MembershipStatus.ACTIVE;
    membership.reason = null;

    return this.membershipRepository.save(membership);
  }

  async getPersonMemberships(personId: string): Promise<GroupMembership[]> {
    await this.personService.findOne(personId); // Validate person exists

    return this.membershipRepository.find({
      where: { personId },
      relations: ['group'],
      order: { createdAt: 'DESC' },
    });
  }

  async getGroupMembers(groupId: string): Promise<GroupMembership[]> {
    await this.groupService.findOne(groupId); // Validate group exists

    return this.membershipRepository.find({
      where: { groupId },
      relations: ['person'],
      order: { createdAt: 'DESC' },
    });
  }

  async getActiveMembers(groupId: string): Promise<GroupMembership[]> {
    await this.groupService.findOne(groupId); // Validate group exists

    return this.membershipRepository.find({
      where: { 
        groupId, 
        status: MembershipStatus.ACTIVE,
      },
      relations: ['person'],
      order: { createdAt: 'DESC' },
    });
  }
}