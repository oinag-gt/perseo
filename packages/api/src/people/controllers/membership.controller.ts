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
} from '@nestjs/swagger';
import { MembershipService } from '../services/membership.service';
import { CreateMembershipDto } from '../dto/create-membership.dto';
import { UpdateMembershipDto } from '../dto/update-membership.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GroupMembership } from '../entities/group-membership.entity';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../auth/entities/user.entity';

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

@ApiTags('people')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('people/memberships')
export class MembershipController {
  constructor(private readonly membershipService: MembershipService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new group membership' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Membership has been successfully created.',
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
  async create(
    @Body() createMembershipDto: CreateMembershipDto,
    @CurrentUser() user: User,
  ): Promise<GroupMembership> {
    return this.membershipService.create(createMembershipDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all memberships with pagination and filtering' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of memberships retrieved successfully.',
  })
  async findAll(@Query() query: MembershipQueryParams) {
    return this.membershipService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a membership by ID' })
  @ApiParam({ name: 'id', description: 'Membership ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Membership retrieved successfully.',
    type: GroupMembership,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Membership not found.',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<GroupMembership> {
    return this.membershipService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a membership' })
  @ApiParam({ name: 'id', description: 'Membership ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Membership has been successfully updated.',
    type: GroupMembership,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Membership not found.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Overlapping membership detected.',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMembershipDto: UpdateMembershipDto,
  ): Promise<GroupMembership> {
    return this.membershipService.update(id, updateMembershipDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a membership' })
  @ApiParam({ name: 'id', description: 'Membership ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Membership has been successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Membership not found.',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.membershipService.remove(id);
  }

  @Post(':id/end')
  @ApiOperation({ summary: 'End a membership with specific end date' })
  @ApiParam({ name: 'id', description: 'Membership ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Membership has been successfully ended.',
    type: GroupMembership,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Membership not found.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid end date.',
  })
  async endMembership(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { endDate: string; reason?: string },
  ): Promise<GroupMembership> {
    const endDate = new Date(body.endDate);
    return this.membershipService.endMembership(id, endDate, body.reason);
  }

  @Post(':id/suspend')
  @ApiOperation({ summary: 'Suspend a membership' })
  @ApiParam({ name: 'id', description: 'Membership ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Membership has been successfully suspended.',
    type: GroupMembership,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Membership not found.',
  })
  async suspendMembership(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { reason: string },
  ): Promise<GroupMembership> {
    return this.membershipService.suspendMembership(id, body.reason);
  }

  @Post(':id/reactivate')
  @ApiOperation({ summary: 'Reactivate a suspended membership' })
  @ApiParam({ name: 'id', description: 'Membership ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Membership has been successfully reactivated.',
    type: GroupMembership,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Membership not found.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Only suspended memberships can be reactivated.',
  })
  async reactivateMembership(@Param('id', ParseUUIDPipe) id: string): Promise<GroupMembership> {
    return this.membershipService.reactivateMembership(id);
  }

  @Get('person/:personId')
  @ApiOperation({ summary: 'Get all memberships for a person' })
  @ApiParam({ name: 'personId', description: 'Person ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Person memberships retrieved successfully.',
  })
  async getPersonMemberships(@Param('personId', ParseUUIDPipe) personId: string): Promise<GroupMembership[]> {
    return this.membershipService.getPersonMemberships(personId);
  }

  @Get('group/:groupId')
  @ApiOperation({ summary: 'Get all members of a group' })
  @ApiParam({ name: 'groupId', description: 'Group ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Group members retrieved successfully.',
  })
  async getGroupMembers(@Param('groupId', ParseUUIDPipe) groupId: string): Promise<GroupMembership[]> {
    return this.membershipService.getGroupMembers(groupId);
  }
}