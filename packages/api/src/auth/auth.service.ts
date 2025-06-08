import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { RegisterDto } from './dto/register.dto';
import { TenantService } from '../database/tenant.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly tenantService: TenantService,
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(
      registerDto.password,
      this.configService.get('bcrypt.rounds'),
    );

    const tenant = this.tenantService.getTenant();
    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
      tenantId: tenant?.id,
    });

    return this.userRepository.save(user);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user || !user.isActive) {
      return null;
    }

    if (user.isLocked()) {
      throw new UnauthorizedException('Account is locked');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      await this.handleFailedLogin(user);
      return null;
    }

    await this.handleSuccessfulLogin(user);
    return user;
  }

  async login(user: User, userAgent?: string, ipAddress?: string) {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      tenantId: user.tenantId,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.createRefreshToken(user, userAgent, ipAddress);

    return {
      accessToken,
      refreshToken: refreshToken.token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
      },
    };
  }

  async refreshAccessToken(refreshTokenStr: string) {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token: refreshTokenStr },
      relations: ['user'],
    });

    if (!refreshToken || !refreshToken.isValid()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const payload = {
      sub: refreshToken.user.id,
      email: refreshToken.user.email,
      roles: refreshToken.user.roles,
      tenantId: refreshToken.user.tenantId,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { token: refreshToken },
      { isRevoked: true },
    );
  }

  private async createRefreshToken(
    user: User,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<RefreshToken> {
    const token = this.jwtService.sign(
      { sub: user.id },
      {
        secret: this.configService.get('jwt.refreshSecret'),
        expiresIn: this.configService.get('jwt.refreshExpiresIn'),
      },
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const refreshToken = this.refreshTokenRepository.create({
      token,
      user,
      expiresAt,
      userAgent,
      ipAddress,
    });

    return this.refreshTokenRepository.save(refreshToken);
  }

  private async handleFailedLogin(user: User): Promise<void> {
    user.failedLoginAttempts += 1;

    if (user.failedLoginAttempts >= 5) {
      const lockUntil = new Date();
      lockUntil.setMinutes(lockUntil.getMinutes() + 30);
      user.lockedUntil = lockUntil;
    }

    await this.userRepository.save(user);
  }

  private async handleSuccessfulLogin(user: User): Promise<void> {
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);
  }
}