import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../database/entities/base.entity';
import { Person } from './person.entity';

export enum DocumentType {
  IDENTIFICATION = 'IDENTIFICATION',
  PROOF_OF_ADDRESS = 'PROOF_OF_ADDRESS',
  ACADEMIC_CERTIFICATE = 'ACADEMIC_CERTIFICATE',
  MEDICAL_CERTIFICATE = 'MEDICAL_CERTIFICATE',
  EMERGENCY_CONTACT_INFO = 'EMERGENCY_CONTACT_INFO',
  PHOTO = 'PHOTO',
  OTHER = 'OTHER',
}

@Entity('documents')
export class Document extends BaseEntity {
  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: DocumentType,
    default: DocumentType.OTHER,
  })
  type: DocumentType;

  @Column()
  url: string;

  @Column()
  fileName: string;

  @Column()
  mimeType: string;

  @Column({ type: 'int' })
  fileSize: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'uuid' })
  @Index()
  personId: string;

  @ManyToOne(() => Person, (person) => person.documents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'personId' })
  person: Person;

  get fileSizeFormatted(): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (this.fileSize === 0) return '0 Bytes';
    const i = Math.floor(Math.log(this.fileSize) / Math.log(1024));
    return Math.round(this.fileSize / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  get isImage(): boolean {
    return this.mimeType.startsWith('image/');
  }

  get isPdf(): boolean {
    return this.mimeType === 'application/pdf';
  }

  get isDocument(): boolean {
    const documentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    return documentTypes.includes(this.mimeType);
  }
}