import { Entity, Column, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../database/entities/base.entity';
import { Tenant } from '../../database/entities/tenant.entity';
import { Person } from './person.entity';

export enum GroupType {
  ADMINISTRATIVE = 'ADMINISTRATIVE',
  ACADEMIC = 'ACADEMIC',
  SOCIAL = 'SOCIAL',
  OTHER = 'OTHER',
}

@Entity('groups')
export class Group extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: GroupType,
    default: GroupType.OTHER,
  })
  type: GroupType;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  parentGroupId?: string;

  @ManyToOne(() => Group, (group) => group.childGroups, { nullable: true })
  @JoinColumn({ name: 'parentGroupId' })
  parentGroup?: Group;

  @OneToMany(() => Group, (group) => group.parentGroup)
  childGroups: Group[];

  @Column({ type: 'uuid', nullable: true })
  @Index()
  leaderId?: string;

  @ManyToOne(() => Person, { nullable: true })
  @JoinColumn({ name: 'leaderId' })
  leader?: Person;

  @Column({ type: 'int', nullable: true })
  maxMembers?: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @OneToMany('GroupMembership', 'group')
  memberships: any[];

  get hasParent(): boolean {
    return !!this.parentGroupId;
  }

  get hasChildren(): boolean {
    return this.childGroups && this.childGroups.length > 0;
  }

}