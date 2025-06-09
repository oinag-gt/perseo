export enum DocumentType {
  IDENTIFICATION = 'IDENTIFICATION',
  PROOF_OF_ADDRESS = 'PROOF_OF_ADDRESS',
  ACADEMIC_CERTIFICATE = 'ACADEMIC_CERTIFICATE',
  MEDICAL_CERTIFICATE = 'MEDICAL_CERTIFICATE',
  EMERGENCY_CONTACT_INFO = 'EMERGENCY_CONTACT_INFO',
  PHOTO = 'PHOTO',
  OTHER = 'OTHER',
}

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  url: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  description?: string;
  isActive: boolean;
  personId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  
  // Relations
  person?: { id: string; firstName: string; lastName: string; email: string };
}

export interface CreateDocumentRequest {
  name: string;
  type: DocumentType;
  fileName: string;
  mimeType: string;
  fileSize: number;
  description?: string;
  personId: string;
  // Note: file upload will be handled separately through multipart form data
}

export interface UpdateDocumentRequest extends Partial<Omit<CreateDocumentRequest, 'personId'>> {
  id: string;
}

export interface DocumentListResponse {
  data: Document[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DocumentSearchParams {
  page?: number;
  limit?: number;
  personId?: string;
  type?: DocumentType;
  isActive?: boolean;
  search?: string; // Search in name and description
  createdAfter?: string;
  createdBefore?: string;
}

export interface DocumentUploadResponse {
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}