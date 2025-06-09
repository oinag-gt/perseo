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

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  alternateEmails?: string[];
  phone: string;
  alternatePhones?: string[];
  birthDate: Date;
  nationalId: string;
  nationalIdType: NationalIdType;
  gender?: Gender;
  address: Address;
  emergencyContact: EmergencyContact;
  preferredLanguage: 'es' | 'en';
  communicationPreferences: CommunicationPreferences;
  photoUrl?: string;
  notes?: string;
  tags?: string[];
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface CreatePersonRequest {
  firstName: string;
  lastName: string;
  email: string;
  alternateEmails?: string[];
  phone: string;
  alternatePhones?: string[];
  birthDate: string; // ISO date string
  nationalId: string;
  nationalIdType: NationalIdType;
  gender?: Gender;
  address: Address;
  emergencyContact: EmergencyContact;
  preferredLanguage?: 'es' | 'en';
  communicationPreferences: CommunicationPreferences;
  photoUrl?: string;
  notes?: string;
  tags?: string[];
}

export interface UpdatePersonRequest extends Partial<CreatePersonRequest> {
  id: string;
}

export interface PersonListResponse {
  data: Person[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PersonSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  email?: string;
  nationalId?: string;
  gender?: Gender;
  tags?: string[];
  isActive?: boolean;
  createdAfter?: string;
  createdBefore?: string;
}