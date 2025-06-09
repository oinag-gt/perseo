import { Entity, Column, Index, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../database/entities/base.entity';
import { Person } from './person.entity';
import { Group } from './group.entity';
import { User } from '../../auth/entities/user.entity';

export enum MembershipRole {
  MEMBER = 'MEMBER',
  LEADER = 'LEADER',
  COORDINATOR = 'COORDINATOR',
}

export enum MembershipStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

@Entity('group_memberships')
@Unique(['personId', 'groupId', 'startDate']) // Prevent duplicate active memberships
export class GroupMembership extends BaseEntity {
  @Column({ type: 'uuid' })
  @Index()
  personId: string;

  @ManyToOne(() => Person, (person) => person.groupMemberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'personId' })
  person: Person;

  @Column({ type: 'uuid' })
  @Index()
  groupId: string;

  @ManyToOne(() => Group, (group) => group.memberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'groupId' })
  group: Group;

  @Column({
    type: 'enum',
    enum: MembershipRole,
    default: MembershipRole.MEMBER,
  })
  role: MembershipRole;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  @Column({
    type: 'enum',
    enum: MembershipStatus,
    default: MembershipStatus.ACTIVE,
  })
  status: MembershipStatus;

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @Column({ type: 'uuid' })
  @Index()
  addedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'addedBy' })
  addedByUser: User;

  get isActive(): boolean {
    return this.status === MembershipStatus.ACTIVE && !this.endDate;
  }

  get duration(): number | null {
    if (!this.endDate) return null;
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  get isCurrentlyActive(): boolean {
    const now = new Date();
    const start = new Date(this.startDate);
    const end = this.endDate ? new Date(this.endDate) : null;
    
    return (
      this.status === MembershipStatus.ACTIVE &&
      start <= now &&
      (!end || end >= now)
    );
  }
}