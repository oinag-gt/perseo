import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { GroupService } from '../services/group.service';
import { MembershipService } from '../services/membership.service';
import { CreateGroupDto } from '../dto/create-group.dto';
import { UpdateGroupDto } from '../dto/update-group.dto';
import { GroupQueryDto } from '../dto/group-query.dto';
import { CreateMembershipDto } from '../dto/create-membership.dto';
import { UpdateMembershipDto } from '../dto/update-membership.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Group } from '../entities/group.entity';
import { GroupMembership } from '../entities/group-membership.entity';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../auth/entities/user.entity';

@ApiTags('people')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('people/groups')
export class GroupController {
  constructor(
    private readonly groupService: GroupService,
    private readonly membershipService: MembershipService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new group' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Group has been successfully created.',
    type: Group,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Group with name already exists in parent group.',
  })
  async create(@Body() createGroupDto: CreateGroupDto): Promise<Group> {
    return this.groupService.create(createGroupDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all groups with pagination and filtering' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of groups retrieved successfully.',
  })
  async findAll(@Query() query: GroupQueryDto) {
    return this.groupService.findAll(query);
  }

  @Get('hierarchy')
  @ApiOperation({ summary: 'Get group hierarchy starting from root groups' })
  @ApiQuery({ name: 'parentId', required: false, description: 'Parent group ID to start hierarchy from' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Group hierarchy retrieved successfully.',
  })
  async getHierarchy(@Query('parentId') parentId?: string) {
    return this.groupService.getHierarchy(parentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a group by ID' })
  @ApiParam({ name: 'id', description: 'Group ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Group retrieved successfully.',
    type: Group,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Group not found.',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Group> {
    return this.groupService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a group' })
  @ApiParam({ name: 'id', description: 'Group ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Group has been successfully updated.',
    type: Group,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Group not found.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or circular reference detected.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Group with name already exists in parent group.',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateGroupDto: UpdateGroupDto,
  ): Promise<Group> {
    return this.groupService.update(id, updateGroupDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a group' })
  @ApiParam({ name: 'id', description: 'Group ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Group has been successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Group not found.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot delete group with child groups or active members.',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.groupService.remove(id);
  }

  // Group membership endpoints
  @Get(':id/members')
  @ApiOperation({ summary: 'Get all members of a group' })
  @ApiParam({ name: 'id', description: 'Group ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Group members retrieved successfully.',
  })
  async getMembers(@Param('id', ParseUUIDPipe) id: string): Promise<GroupMembership[]> {
    return this.membershipService.getGroupMembers(id);
  }

  @Get(':id/members/active')
  @ApiOperation({ summary: 'Get active members of a group' })
  @ApiParam({ name: 'id', description: 'Group ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Active group members retrieved successfully.',
  })
  async getActiveMembers(@Param('id', ParseUUIDPipe) id: string): Promise<GroupMembership[]> {
    return this.membershipService.getActiveMembers(id);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add a member to a group' })
  @ApiParam({ name: 'id', description: 'Group ID' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Member has been successfully added to group.',
    type: GroupMembership,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or group at capacity.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Person already has active membership in this group.',
  })
  async addMember(
    @Param('id', ParseUUIDPipe) groupId: string,
    @Body() createMembershipDto: CreateMembershipDto,
    @CurrentUser() user: User,
  ): Promise<GroupMembership> {
    // Ensure the groupId matches the one in the DTO
    createMembershipDto.groupId = groupId;
    return this.membershipService.create(createMembershipDto, user.id);
  }

  @Patch(':groupId/members/:personId')
  @ApiOperation({ summary: 'Update a group membership' })
  @ApiParam({ name: 'groupId', description: 'Group ID' })
  @ApiParam({ name: 'personId', description: 'Person ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Membership has been successfully updated.',
    type: GroupMembership,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Membership not found.',
  })
  async updateMember(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Param('personId', ParseUUIDPipe) personId: string,
    @Body() updateMembershipDto: UpdateMembershipDto,
  ): Promise<GroupMembership> {
    // Find the membership by groupId and personId
    const memberships = await this.membershipService.findAll({ groupId, personId });
    if (!memberships.data.length) {
      throw new Error('Membership not found');
    }
    
    const membership = memberships.data[0];
    return this.membershipService.update(membership.id, updateMembershipDto);
  }

  @Delete(':groupId/members/:personId')
  @ApiOperation({ summary: 'Remove a member from a group' })
  @ApiParam({ name: 'groupId', description: 'Group ID' })
  @ApiParam({ name: 'personId', description: 'Person ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Member has been successfully removed from group.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Membership not found.',
  })
  async removeMember(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Param('personId', ParseUUIDPipe) personId: string,
  ): Promise<void> {
    // Find the membership by groupId and personId
    const memberships = await this.membershipService.findAll({ groupId, personId });
    if (!memberships.data.length) {
      throw new Error('Membership not found');
    }
    
    const membership = memberships.data[0];
    return this.membershipService.remove(membership.id);
  }
}