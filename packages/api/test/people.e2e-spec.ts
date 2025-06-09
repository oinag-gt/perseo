import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from '../src/app.module';
import { Person } from '../src/people/entities/person.entity';
import { Group } from '../src/people/entities/group.entity';
import { GroupMembership, MembershipRole, MembershipStatus } from '../src/people/entities/group-membership.entity';

describe('People Module (e2e)', () => {
  let app: INestApplication;
  let personRepository: Repository<Person>;
  let groupRepository: Repository<Group>;
  let membershipRepository: Repository<GroupMembership>;

  const mockTenantId = 'test-tenant-123';
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    personRepository = moduleFixture.get<Repository<Person>>(getRepositoryToken(Person));
    groupRepository = moduleFixture.get<Repository<Group>>(getRepositoryToken(Group));
    membershipRepository = moduleFixture.get<Repository<GroupMembership>>(getRepositoryToken(GroupMembership));

    // Setup test authentication
    // This would typically involve creating a test user and getting a JWT token
    authToken = 'test-jwt-token';
  });

  afterAll(async () => {
    // Clean up test data
    await membershipRepository.delete({ tenantId: mockTenantId });
    await personRepository.delete({ tenantId: mockTenantId });
    await groupRepository.delete({ tenantId: mockTenantId });
    await app.close();
  });

  beforeEach(async () => {
    // Clean up before each test
    await membershipRepository.delete({ tenantId: mockTenantId });
    await personRepository.delete({ tenantId: mockTenantId });
    await groupRepository.delete({ tenantId: mockTenantId });
  });

  describe('/people/persons (GET)', () => {
    it('should return empty list when no persons exist', () => {
      return request(app.getHttpServer())
        .get('/people/persons')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toEqual([]);
          expect(res.body.totalItems).toBe(0);
          expect(res.body.totalPages).toBe(0);
          expect(res.body.currentPage).toBe(1);
        });
    });

    it('should return paginated persons', async () => {
      // Create test persons
      const person1 = personRepository.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        birthDate: new Date('1990-01-01'),
        nationalId: '12345678',
        nationalIdType: 'DNI',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          postalCode: '12345',
          country: 'USA',
        },
        emergencyContact: {
          name: 'Jane Doe',
          relationship: 'Spouse',
          phone: '+1234567891',
        },
        communicationPreferences: {
          email: true,
          sms: false,
          whatsapp: false,
        },
        tenantId: mockTenantId,
      });

      const person2 = personRepository.create({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+1234567892',
        birthDate: new Date('1992-05-15'),
        nationalId: '87654321',
        nationalIdType: 'DNI',
        address: {
          street: '456 Oak Ave',
          city: 'Otherville',
          state: 'NY',
          postalCode: '54321',
          country: 'USA',
        },
        emergencyContact: {
          name: 'John Smith',
          relationship: 'Spouse',
          phone: '+1234567893',
        },
        communicationPreferences: {
          email: true,
          sms: true,
          whatsapp: false,
        },
        tenantId: mockTenantId,
      });

      await personRepository.save([person1, person2]);

      return request(app.getHttpServer())
        .get('/people/persons?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(2);
          expect(res.body.totalItems).toBe(2);
          expect(res.body.totalPages).toBe(1);
          expect(res.body.currentPage).toBe(1);
        });
    });

    it('should search persons by name', async () => {
      const person = personRepository.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        birthDate: new Date('1990-01-01'),
        nationalId: '12345678',
        nationalIdType: 'DNI',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          postalCode: '12345',
          country: 'USA',
        },
        emergencyContact: {
          name: 'Jane Doe',
          relationship: 'Spouse',
          phone: '+1234567891',
        },
        communicationPreferences: {
          email: true,
          sms: false,
          whatsapp: false,
        },
        tenantId: mockTenantId,
      });

      await personRepository.save(person);

      return request(app.getHttpServer())
        .get('/people/persons?search=John')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(1);
          expect(res.body.data[0].firstName).toBe('John');
        });
    });
  });

  describe('/people/persons (POST)', () => {
    it('should create a new person', () => {
      const createPersonDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        birthDate: '1990-01-01',
        nationalId: '12345678',
        nationalIdType: 'DNI',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          postalCode: '12345',
          country: 'USA',
        },
        emergencyContact: {
          name: 'Jane Doe',
          relationship: 'Spouse',
          phone: '+1234567891',
        },
        communicationPreferences: {
          email: true,
          sms: false,
          whatsapp: false,
        },
      };

      return request(app.getHttpServer())
        .post('/people/persons')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createPersonDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.firstName).toBe('John');
          expect(res.body.lastName).toBe('Doe');
          expect(res.body.email).toBe('john.doe@example.com');
          expect(res.body.id).toBeDefined();
        });
    });

    it('should return 409 when email already exists', async () => {
      const person = personRepository.create({
        firstName: 'Existing',
        lastName: 'User',
        email: 'existing@example.com',
        phone: '+1234567890',
        birthDate: new Date('1990-01-01'),
        nationalId: '12345678',
        nationalIdType: 'DNI',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          postalCode: '12345',
          country: 'USA',
        },
        emergencyContact: {
          name: 'Emergency Contact',
          relationship: 'Friend',
          phone: '+1234567891',
        },
        communicationPreferences: {
          email: true,
          sms: false,
          whatsapp: false,
        },
        tenantId: mockTenantId,
      });

      await personRepository.save(person);

      const createPersonDto = {
        firstName: 'New',
        lastName: 'User',
        email: 'existing@example.com', // Same email
        phone: '+1234567899',
        birthDate: '1992-01-01',
        nationalId: '87654321',
        nationalIdType: 'DNI',
        address: {
          street: '456 Oak Ave',
          city: 'Otherville',
          state: 'NY',
          postalCode: '54321',
          country: 'USA',
        },
        emergencyContact: {
          name: 'Another Contact',
          relationship: 'Family',
          phone: '+1234567892',
        },
        communicationPreferences: {
          email: true,
          sms: false,
          whatsapp: false,
        },
      };

      return request(app.getHttpServer())
        .post('/people/persons')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createPersonDto)
        .expect(409);
    });

    it('should validate required fields', () => {
      const invalidPersonDto = {
        firstName: 'John',
        // Missing required fields
      };

      return request(app.getHttpServer())
        .post('/people/persons')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidPersonDto)
        .expect(400);
    });
  });

  describe('/people/groups (GET)', () => {
    it('should return empty list when no groups exist', () => {
      return request(app.getHttpServer())
        .get('/people/groups')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toEqual([]);
          expect(res.body.totalItems).toBe(0);
        });
    });

    it('should return paginated groups', async () => {
      const group1 = groupRepository.create({
        name: 'Test Group 1',
        description: 'First test group',
        groupType: 'COURSE',
        maxMembers: 25,
        tenantId: mockTenantId,
      });

      const group2 = groupRepository.create({
        name: 'Test Group 2',
        description: 'Second test group',
        groupType: 'DEPARTMENT',
        maxMembers: 50,
        tenantId: mockTenantId,
      });

      await groupRepository.save([group1, group2]);

      return request(app.getHttpServer())
        .get('/people/groups?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(2);
          expect(res.body.totalItems).toBe(2);
        });
    });
  });

  describe('/people/groups (POST)', () => {
    it('should create a new group', () => {
      const createGroupDto = {
        name: 'Test Group',
        description: 'A test group',
        groupType: 'COURSE',
        maxMembers: 25,
      };

      return request(app.getHttpServer())
        .post('/people/groups')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createGroupDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.name).toBe('Test Group');
          expect(res.body.groupType).toBe('COURSE');
          expect(res.body.maxMembers).toBe(25);
          expect(res.body.id).toBeDefined();
        });
    });

    it('should return 409 when group name already exists', async () => {
      const group = groupRepository.create({
        name: 'Existing Group',
        description: 'An existing group',
        groupType: 'COURSE',
        maxMembers: 25,
        tenantId: mockTenantId,
      });

      await groupRepository.save(group);

      const createGroupDto = {
        name: 'Existing Group', // Same name
        description: 'Another group',
        groupType: 'DEPARTMENT',
        maxMembers: 30,
      };

      return request(app.getHttpServer())
        .post('/people/groups')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createGroupDto)
        .expect(409);
    });
  });

  describe('/people/memberships (POST)', () => {
    it('should create a new membership', async () => {
      // Create test person and group
      const person = personRepository.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        birthDate: new Date('1990-01-01'),
        nationalId: '12345678',
        nationalIdType: 'DNI',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          postalCode: '12345',
          country: 'USA',
        },
        emergencyContact: {
          name: 'Jane Doe',
          relationship: 'Spouse',
          phone: '+1234567891',
        },
        communicationPreferences: {
          email: true,
          sms: false,
          whatsapp: false,
        },
        tenantId: mockTenantId,
      });

      const group = groupRepository.create({
        name: 'Test Group',
        description: 'A test group',
        groupType: 'COURSE',
        maxMembers: 25,
        tenantId: mockTenantId,
      });

      const savedPerson = await personRepository.save(person);
      const savedGroup = await groupRepository.save(group);

      const createMembershipDto = {
        personId: savedPerson.id,
        groupId: savedGroup.id,
        role: MembershipRole.MEMBER,
        startDate: '2024-01-01',
      };

      return request(app.getHttpServer())
        .post('/people/memberships')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createMembershipDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.personId).toBe(savedPerson.id);
          expect(res.body.groupId).toBe(savedGroup.id);
          expect(res.body.role).toBe(MembershipRole.MEMBER);
          expect(res.body.status).toBe(MembershipStatus.ACTIVE);
        });
    });

    it('should return 409 when membership already exists', async () => {
      // Create test person, group, and existing membership
      const person = personRepository.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        birthDate: new Date('1990-01-01'),
        nationalId: '12345678',
        nationalIdType: 'DNI',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          postalCode: '12345',
          country: 'USA',
        },
        emergencyContact: {
          name: 'Jane Doe',
          relationship: 'Spouse',
          phone: '+1234567891',
        },
        communicationPreferences: {
          email: true,
          sms: false,
          whatsapp: false,
        },
        tenantId: mockTenantId,
      });

      const group = groupRepository.create({
        name: 'Test Group',
        description: 'A test group',
        groupType: 'COURSE',
        maxMembers: 25,
        tenantId: mockTenantId,
      });

      const savedPerson = await personRepository.save(person);
      const savedGroup = await groupRepository.save(group);

      const existingMembership = membershipRepository.create({
        personId: savedPerson.id,
        groupId: savedGroup.id,
        role: MembershipRole.MEMBER,
        status: MembershipStatus.ACTIVE,
        startDate: new Date('2024-01-01'),
        tenantId: mockTenantId,
      });

      await membershipRepository.save(existingMembership);

      const createMembershipDto = {
        personId: savedPerson.id,
        groupId: savedGroup.id,
        role: MembershipRole.LEADER,
        startDate: '2024-01-01',
      };

      return request(app.getHttpServer())
        .post('/people/memberships')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createMembershipDto)
        .expect(409);
    });
  });

  describe('Integration: Person -> Group -> Membership flow', () => {
    it('should create person, group, and membership in sequence', async () => {
      // Step 1: Create person
      const createPersonDto = {
        firstName: 'Integration',
        lastName: 'Test',
        email: 'integration.test@example.com',
        phone: '+1234567890',
        birthDate: '1990-01-01',
        nationalId: '12345678',
        nationalIdType: 'DNI',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          postalCode: '12345',
          country: 'USA',
        },
        emergencyContact: {
          name: 'Emergency Contact',
          relationship: 'Friend',
          phone: '+1234567891',
        },
        communicationPreferences: {
          email: true,
          sms: false,
          whatsapp: false,
        },
      };

      const personResponse = await request(app.getHttpServer())
        .post('/people/persons')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createPersonDto)
        .expect(201);

      const personId = personResponse.body.id;

      // Step 2: Create group
      const createGroupDto = {
        name: 'Integration Test Group',
        description: 'A group for integration testing',
        groupType: 'COURSE',
        maxMembers: 25,
      };

      const groupResponse = await request(app.getHttpServer())
        .post('/people/groups')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createGroupDto)
        .expect(201);

      const groupId = groupResponse.body.id;

      // Step 3: Create membership
      const createMembershipDto = {
        personId: personId,
        groupId: groupId,
        role: MembershipRole.MEMBER,
        startDate: '2024-01-01',
      };

      const membershipResponse = await request(app.getHttpServer())
        .post('/people/memberships')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createMembershipDto)
        .expect(201);

      // Step 4: Verify membership was created correctly
      expect(membershipResponse.body.personId).toBe(personId);
      expect(membershipResponse.body.groupId).toBe(groupId);
      expect(membershipResponse.body.status).toBe(MembershipStatus.ACTIVE);

      // Step 5: Verify person memberships endpoint
      const personMembershipsResponse = await request(app.getHttpServer())
        .get(`/people/memberships/person/${personId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(personMembershipsResponse.body).toHaveLength(1);
      expect(personMembershipsResponse.body[0].groupId).toBe(groupId);
    });
  });
});