import { Entity, Column, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../database/entities/base.entity';
import { Tenant } from '../../database/entities/tenant.entity';

export enum Gender {
  MALE = 'M',
  FEMALE = 'F',
  OTHER = 'OTHER',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
}

export enum NationalIdType {
  DNI = 'DNI',
  PASSPORT = 'PASSPORT',
  OTHER = 'OTHER',
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface CommunicationPreferences {
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
}

@Entity('persons')
export class Person extends BaseEntity {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  @Index()
  email: string;

  @Column('simple-array', { nullable: true })
  alternateEmails?: string[];

  @Column()
  phone: string;

  @Column('simple-array', { nullable: true })
  alternatePhones?: string[];

  @Column({ type: 'date' })
  birthDate: Date;

  @Column({ unique: true })
  @Index()
  nationalId: string;

  @Column({
    type: 'enum',
    enum: NationalIdType,
    default: NationalIdType.DNI,
  })
  nationalIdType: NationalIdType;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender?: Gender;

  @Column({ type: 'jsonb' })
  address: Address;

  @Column({ type: 'jsonb' })
  emergencyContact: EmergencyContact;

  @Column({
    type: 'enum',
    enum: ['es', 'en'],
    default: 'es',
  })
  preferredLanguage: 'es' | 'en';

  @Column({ type: 'jsonb' })
  communicationPreferences: CommunicationPreferences;

  @Column({ nullable: true })
  photoUrl?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column('simple-array', { nullable: true })
  tags?: string[];

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @OneToMany('GroupMembership', 'person')
  groupMemberships: any[];

  @OneToMany('Document', 'person')
  documents: any[];

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get age(): number {
    const today = new Date();
    const birthDate = new Date(this.birthDate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
}