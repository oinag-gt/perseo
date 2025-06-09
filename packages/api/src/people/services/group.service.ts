import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from '../entities/group.entity';
import { CreateGroupDto } from '../dto/create-group.dto';
import { UpdateGroupDto } from '../dto/update-group.dto';
import { GroupQueryDto } from '../dto/group-query.dto';
import { TenantService } from '../../database/tenant.service';
import { PersonService } from './person.service';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    private readonly tenantService: TenantService,
    private readonly personService: PersonService,
  ) {}

  async create(createGroupDto: CreateGroupDto): Promise<Group> {
    const tenantId = this.tenantService.getCurrentTenantId();
    
    // Check for duplicate name within the same parent
    const existingGroup = await this.groupRepository.findOne({
      where: { 
        name: createGroupDto.name, 
        tenantId,
        parentGroupId: createGroupDto.parentGroupId || null,
      },
    });
    if (existingGroup) {
      throw new ConflictException('Group with this name already exists in the same parent group');
    }

    // Validate parent group exists and belongs to tenant
    if (createGroupDto.parentGroupId) {
      const parentGroup = await this.groupRepository.findOne({
        where: { id: createGroupDto.parentGroupId, tenantId },
      });
      if (!parentGroup) {
        throw new NotFoundException('Parent group not found');
      }
    }

    // Validate leader exists and belongs to tenant
    if (createGroupDto.leaderId) {
      try {
        await this.personService.findOne(createGroupDto.leaderId);
      } catch {
        throw new NotFoundException('Leader person not found');
      }
    }

    const group = this.groupRepository.create({
      ...createGroupDto,
      tenantId,
      isActive: createGroupDto.isActive !== false,
    });

    return this.groupRepository.save(group);
  }

  async findAll(query: GroupQueryDto): Promise<{ data: Group[]; total: number; totalPages: number }> {
    const tenantId = this.tenantService.getCurrentTenantId();
    const { page = 1, limit = 20, search, type, parentGroupId, leaderId, isActive, hasMembers, createdAfter, createdBefore } = query;

    const queryBuilder = this.groupRepository.createQueryBuilder('group')
      .leftJoinAndSelect('group.leader', 'leader')
      .leftJoinAndSelect('group.parentGroup', 'parentGroup')
      .where('group.tenantId = :tenantId', { tenantId });

    if (search) {
      queryBuilder.andWhere(
        '(group.name ILIKE :search OR group.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (type) {
      queryBuilder.andWhere('group.type = :type', { type });
    }

    if (parentGroupId) {
      queryBuilder.andWhere('group.parentGroupId = :parentGroupId', { parentGroupId });
    }

    if (leaderId) {
      queryBuilder.andWhere('group.leaderId = :leaderId', { leaderId });
    }

    if (typeof isActive === 'boolean') {
      queryBuilder.andWhere('group.isActive = :isActive', { isActive });
    }

    if (typeof hasMembers === 'boolean') {
      if (hasMembers) {
        queryBuilder.andWhere('EXISTS (SELECT 1 FROM group_memberships gm WHERE gm.groupId = group.id AND gm.status = :activeStatus)', 
          { activeStatus: 'ACTIVE' });
      } else {
        queryBuilder.andWhere('NOT EXISTS (SELECT 1 FROM group_memberships gm WHERE gm.groupId = group.id AND gm.status = :activeStatus)', 
          { activeStatus: 'ACTIVE' });
      }
    }

    if (createdAfter) {
      queryBuilder.andWhere('group.createdAt >= :createdAfter', { createdAfter });
    }

    if (createdBefore) {
      queryBuilder.andWhere('group.createdAt <= :createdBefore', { createdBefore });
    }

    const total = await queryBuilder.getCount();
    const totalPages = Math.ceil(total / limit);

    const data = await queryBuilder
      .orderBy('group.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total, totalPages };
  }

  async findOne(id: string): Promise<Group> {
    const tenantId = this.tenantService.getCurrentTenantId();
    const group = await this.groupRepository.findOne({
      where: { id, tenantId },
      relations: ['leader', 'parentGroup', 'childGroups', 'memberships', 'memberships.person'],
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    return group;
  }

  async update(id: string, updateGroupDto: UpdateGroupDto): Promise<Group> {
    const group = await this.findOne(id);
    const tenantId = this.tenantService.getCurrentTenantId();

    // Check for duplicate name if name is being updated
    if (updateGroupDto.name && updateGroupDto.name !== group.name) {
      const existingGroup = await this.groupRepository.findOne({
        where: { 
          name: updateGroupDto.name, 
          tenantId,
          parentGroupId: updateGroupDto.parentGroupId || group.parentGroupId || null,
        },
      });
      if (existingGroup && existingGroup.id !== id) {
        throw new ConflictException('Group with this name already exists in the same parent group');
      }
    }

    // Validate parent group if being updated
    if (updateGroupDto.parentGroupId !== undefined) {
      if (updateGroupDto.parentGroupId) {
        // Check if the new parent group exists
        const parentGroup = await this.groupRepository.findOne({
          where: { id: updateGroupDto.parentGroupId, tenantId },
        });
        if (!parentGroup) {
          throw new NotFoundException('Parent group not found');
        }

        // Prevent circular references
        if (await this.wouldCreateCircularReference(id, updateGroupDto.parentGroupId)) {
          throw new BadRequestException('Cannot set parent group: would create circular reference');
        }
      }
    }

    // Validate leader if being updated
    if (updateGroupDto.leaderId !== undefined) {
      if (updateGroupDto.leaderId) {
        try {
          await this.personService.findOne(updateGroupDto.leaderId);
        } catch {
          throw new NotFoundException('Leader person not found');
        }
      }
    }

    Object.assign(group, updateGroupDto);
    return this.groupRepository.save(group);
  }

  async remove(id: string): Promise<void> {
    const group = await this.findOne(id);
    
    // Check if group has child groups
    const childGroups = await this.groupRepository.find({
      where: { parentGroupId: id },
    });
    
    if (childGroups.length > 0) {
      throw new BadRequestException('Cannot delete group with child groups');
    }

    // Check if group has active memberships
    const activeMemberships = await this.groupRepository.query(
      'SELECT COUNT(*) FROM group_memberships WHERE "groupId" = $1 AND status = $2',
      [id, 'ACTIVE']
    );
    
    if (parseInt(activeMemberships[0].count) > 0) {
      throw new BadRequestException('Cannot delete group with active members');
    }

    await this.groupRepository.remove(group);
  }

  async getHierarchy(parentId?: string): Promise<Group[]> {
    const tenantId = this.tenantService.getCurrentTenantId();
    
    const queryBuilder = this.groupRepository.createQueryBuilder('group')
      .leftJoinAndSelect('group.leader', 'leader')
      .where('group.tenantId = :tenantId', { tenantId })
      .andWhere('group.isActive = :isActive', { isActive: true });

    if (parentId) {
      queryBuilder.andWhere('group.parentGroupId = :parentId', { parentId });
    } else {
      queryBuilder.andWhere('group.parentGroupId IS NULL');
    }

    return queryBuilder
      .orderBy('group.name', 'ASC')
      .getMany();
  }

  private async wouldCreateCircularReference(groupId: string, newParentId: string): Promise<boolean> {
    // Check if newParentId is a descendant of groupId
    const descendants = await this.getDescendants(groupId);
    return descendants.some(descendant => descendant.id === newParentId);
  }

  private async getDescendants(groupId: string): Promise<Group[]> {
    const tenantId = this.tenantService.getCurrentTenantId();
    const descendants: Group[] = [];

    const children = await this.groupRepository.find({
      where: { parentGroupId: groupId, tenantId },
    });

    for (const child of children) {
      descendants.push(child);
      const childDescendants = await this.getDescendants(child.id);
      descendants.push(...childDescendants);
    }

    return descendants;
  }
}