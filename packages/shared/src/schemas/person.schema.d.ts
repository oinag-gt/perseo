import { z } from 'zod';
import { Gender, NationalIdType } from '../types/person';
export declare const AddressSchema: z.ZodObject<{
    street: z.ZodString;
    city: z.ZodString;
    state: z.ZodString;
    postalCode: z.ZodString;
    country: z.ZodString;
}, "strip", z.ZodTypeAny, {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
}, {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
}>;
export declare const EmergencyContactSchema: z.ZodObject<{
    name: z.ZodString;
    relationship: z.ZodString;
    phone: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    email?: string;
    phone?: string;
    relationship?: string;
}, {
    name?: string;
    email?: string;
    phone?: string;
    relationship?: string;
}>;
export declare const CommunicationPreferencesSchema: z.ZodEffects<z.ZodObject<{
    email: z.ZodBoolean;
    sms: z.ZodBoolean;
    whatsapp: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    email?: boolean;
    sms?: boolean;
    whatsapp?: boolean;
}, {
    email?: boolean;
    sms?: boolean;
    whatsapp?: boolean;
}>, {
    email?: boolean;
    sms?: boolean;
    whatsapp?: boolean;
}, {
    email?: boolean;
    sms?: boolean;
    whatsapp?: boolean;
}>;
export declare const CreatePersonSchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    alternateEmails: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    phone: z.ZodString;
    alternatePhones: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    birthDate: z.ZodEffects<z.ZodString, string, string>;
    nationalId: z.ZodString;
    nationalIdType: z.ZodNativeEnum<typeof NationalIdType>;
    gender: z.ZodOptional<z.ZodNativeEnum<typeof Gender>>;
    address: z.ZodObject<{
        street: z.ZodString;
        city: z.ZodString;
        state: z.ZodString;
        postalCode: z.ZodString;
        country: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        street?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
    }, {
        street?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
    }>;
    emergencyContact: z.ZodObject<{
        name: z.ZodString;
        relationship: z.ZodString;
        phone: z.ZodString;
        email: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        email?: string;
        phone?: string;
        relationship?: string;
    }, {
        name?: string;
        email?: string;
        phone?: string;
        relationship?: string;
    }>;
    preferredLanguage: z.ZodDefault<z.ZodEnum<["es", "en"]>>;
    communicationPreferences: z.ZodEffects<z.ZodObject<{
        email: z.ZodBoolean;
        sms: z.ZodBoolean;
        whatsapp: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        email?: boolean;
        sms?: boolean;
        whatsapp?: boolean;
    }, {
        email?: boolean;
        sms?: boolean;
        whatsapp?: boolean;
    }>, {
        email?: boolean;
        sms?: boolean;
        whatsapp?: boolean;
    }, {
        email?: boolean;
        sms?: boolean;
        whatsapp?: boolean;
    }>;
    photoUrl: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    address?: {
        street?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
    };
    email?: string;
    firstName?: string;
    lastName?: string;
    tags?: string[];
    alternateEmails?: string[];
    phone?: string;
    alternatePhones?: string[];
    birthDate?: string;
    nationalId?: string;
    nationalIdType?: NationalIdType;
    gender?: Gender;
    emergencyContact?: {
        name?: string;
        email?: string;
        phone?: string;
        relationship?: string;
    };
    preferredLanguage?: "es" | "en";
    communicationPreferences?: {
        email?: boolean;
        sms?: boolean;
        whatsapp?: boolean;
    };
    photoUrl?: string;
    notes?: string;
}, {
    address?: {
        street?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
    };
    email?: string;
    firstName?: string;
    lastName?: string;
    tags?: string[];
    alternateEmails?: string[];
    phone?: string;
    alternatePhones?: string[];
    birthDate?: string;
    nationalId?: string;
    nationalIdType?: NationalIdType;
    gender?: Gender;
    emergencyContact?: {
        name?: string;
        email?: string;
        phone?: string;
        relationship?: string;
    };
    preferredLanguage?: "es" | "en";
    communicationPreferences?: {
        email?: boolean;
        sms?: boolean;
        whatsapp?: boolean;
    };
    photoUrl?: string;
    notes?: string;
}>;
export declare const UpdatePersonSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    alternateEmails: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    phone: z.ZodOptional<z.ZodString>;
    alternatePhones: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    birthDate: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    nationalId: z.ZodOptional<z.ZodString>;
    nationalIdType: z.ZodOptional<z.ZodNativeEnum<typeof NationalIdType>>;
    gender: z.ZodOptional<z.ZodOptional<z.ZodNativeEnum<typeof Gender>>>;
    address: z.ZodOptional<z.ZodObject<{
        street: z.ZodString;
        city: z.ZodString;
        state: z.ZodString;
        postalCode: z.ZodString;
        country: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        street?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
    }, {
        street?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
    }>>;
    emergencyContact: z.ZodOptional<z.ZodObject<{
        name: z.ZodString;
        relationship: z.ZodString;
        phone: z.ZodString;
        email: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        email?: string;
        phone?: string;
        relationship?: string;
    }, {
        name?: string;
        email?: string;
        phone?: string;
        relationship?: string;
    }>>;
    preferredLanguage: z.ZodOptional<z.ZodDefault<z.ZodEnum<["es", "en"]>>>;
    communicationPreferences: z.ZodOptional<z.ZodEffects<z.ZodObject<{
        email: z.ZodBoolean;
        sms: z.ZodBoolean;
        whatsapp: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        email?: boolean;
        sms?: boolean;
        whatsapp?: boolean;
    }, {
        email?: boolean;
        sms?: boolean;
        whatsapp?: boolean;
    }>, {
        email?: boolean;
        sms?: boolean;
        whatsapp?: boolean;
    }, {
        email?: boolean;
        sms?: boolean;
        whatsapp?: boolean;
    }>>;
    photoUrl: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    notes: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    tags: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
} & {
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id?: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
    };
    email?: string;
    firstName?: string;
    lastName?: string;
    tags?: string[];
    alternateEmails?: string[];
    phone?: string;
    alternatePhones?: string[];
    birthDate?: string;
    nationalId?: string;
    nationalIdType?: NationalIdType;
    gender?: Gender;
    emergencyContact?: {
        name?: string;
        email?: string;
        phone?: string;
        relationship?: string;
    };
    preferredLanguage?: "es" | "en";
    communicationPreferences?: {
        email?: boolean;
        sms?: boolean;
        whatsapp?: boolean;
    };
    photoUrl?: string;
    notes?: string;
}, {
    id?: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
    };
    email?: string;
    firstName?: string;
    lastName?: string;
    tags?: string[];
    alternateEmails?: string[];
    phone?: string;
    alternatePhones?: string[];
    birthDate?: string;
    nationalId?: string;
    nationalIdType?: NationalIdType;
    gender?: Gender;
    emergencyContact?: {
        name?: string;
        email?: string;
        phone?: string;
        relationship?: string;
    };
    preferredLanguage?: "es" | "en";
    communicationPreferences?: {
        email?: boolean;
        sms?: boolean;
        whatsapp?: boolean;
    };
    photoUrl?: string;
    notes?: string;
}>;
export declare const PersonSearchSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    nationalId: z.ZodOptional<z.ZodString>;
    gender: z.ZodOptional<z.ZodNativeEnum<typeof Gender>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    createdAfter: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    createdBefore: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
}, "strip", z.ZodTypeAny, {
    search?: string;
    isActive?: boolean;
    email?: string;
    tags?: string[];
    nationalId?: string;
    gender?: Gender;
    page?: number;
    limit?: number;
    createdAfter?: string;
    createdBefore?: string;
}, {
    search?: string;
    isActive?: boolean;
    email?: string;
    tags?: string[];
    nationalId?: string;
    gender?: Gender;
    page?: number;
    limit?: number;
    createdAfter?: string;
    createdBefore?: string;
}>;
export declare const PersonIdSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id?: string;
}, {
    id?: string;
}>;
//# sourceMappingURL=person.schema.d.ts.map