import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { TenantService } from '../database/tenant.service';
import { EmailService } from '../email/email.service';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const bcrypt = require('bcrypt');

describe('AuthService', () => {
  let service: AuthService;

  const mockUser = {
    id: '123',
    email: 'test@example.com',
    password: 'hashedPassword',
    firstName: 'Test',
    lastName: 'User',
    isActive: true,
    isEmailVerified: false,
    roles: ['member'],
    failedLoginAttempts: 0,
    lockedUntil: null as Date | null,
    lastLoginAt: null as Date | null,
    lastLoginIp: null as string | null,
    tenantId: 'tenant-123',
    isLocked: () => false,
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockRefreshTokenRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockTenantService = {
    getTenant: jest.fn(),
  };

  const mockEmailService = {
    sendVerificationEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: mockRefreshTokenRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: TenantService,
          useValue: mockTenantService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashedPassword');
      mockConfigService.get.mockReturnValue(12);
      mockTenantService.getTenant.mockReturnValue({ id: 'tenant-123' });
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockEmailService.sendVerificationEmail.mockResolvedValue(undefined);

      const result = await service.register(registerDto);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw error if user already exists', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Existing',
        lastName: 'User',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('validateUser', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return user for valid credentials', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null for invalid credentials', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.validateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });

    it('should return null for non-existent user', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.validateUser('notfound@example.com', 'password');

      expect(result).toBeNull();
    });

    it('should throw UnauthorizedException for locked account', async () => {
      const lockedUser = {
        ...mockUser,
        isLocked: () => true,
      };
      mockUserRepository.findOne.mockResolvedValue(lockedUser);

      await expect(
        service.validateUser('test@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should return login response with tokens', async () => {
      const mockRefreshToken = {
        token: 'refresh-token-123',
      };

      mockJwtService.sign.mockReturnValue('access-token-123');
      mockRefreshTokenRepository.create.mockReturnValue(mockRefreshToken);
      mockRefreshTokenRepository.save.mockResolvedValue(mockRefreshToken);

      const result = await service.login(mockUser as any);

      expect(result).toHaveProperty('accessToken', 'access-token-123');
      expect(result).toHaveProperty('refreshToken', 'refresh-token-123');
      expect(result).toHaveProperty('user');
      expect(result.user).toHaveProperty('id', mockUser.id);
      expect(result.user).toHaveProperty('role', 'member');
    });
  });
});