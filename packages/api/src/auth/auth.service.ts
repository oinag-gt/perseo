import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from './entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { RegisterDto } from './dto/register.dto';
import { TenantService } from '../database/tenant.service';
import { EmailService } from '../email/email.service';

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
    private readonly emailService: EmailService,
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
    
    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date();
    emailVerificationExpires.setHours(emailVerificationExpires.getHours() + 24); // 24 hours
    
    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
      tenantId: tenant?.id,
      emailVerificationToken,
      emailVerificationExpires,
    });

    const savedUser = await this.userRepository.save(user);
    
    // Send verification email (non-blocking - don't fail registration if email fails)
    try {
      await this.emailService.sendVerificationEmail(
        savedUser.email,
        emailVerificationToken,
        savedUser.firstName,
      );
      console.log('Verification email sent successfully');
    } catch (error) {
      console.error('Failed to send verification email:', error instanceof Error ? error.message : 'Unknown error');
      // Don't throw error - user is still registered even if email fails
    }
    
    return savedUser;
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    try {
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
    } catch (error) {
      console.error('Error in validateUser:', error);
      throw error;
    }
  }

  async login(user: User, userAgent?: string, ipAddress?: string) {
    try {
      const payload = {
        sub: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        emailVerified: user.isEmailVerified,
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
          role: user.roles && user.roles.length > 0 ? user.roles[0] : 'member',
          emailVerified: user.isEmailVerified,
          tenantId: user.tenantId,
        },
      };
    } catch (error) {
      console.error('Error in login method:', error);
      throw error;
    }
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
      firstName: refreshToken.user.firstName,
      lastName: refreshToken.user.lastName,
      roles: refreshToken.user.roles,
      emailVerified: refreshToken.user.isEmailVerified,
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
    try {
      console.log('Creating refresh token for user:', user.id);
      
      const token = this.jwtService.sign(
        { sub: user.id },
        {
          secret: this.configService.get('jwt.refreshSecret'),
          expiresIn: this.configService.get('jwt.refreshExpiresIn'),
        },
      );
      
      console.log('JWT refresh token created');

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const refreshToken = this.refreshTokenRepository.create({
        token,
        user,
        expiresAt,
        userAgent,
        ipAddress,
      });
      
      console.log('Refresh token entity created');

      const savedToken = await this.refreshTokenRepository.save(refreshToken);
      console.log('Refresh token saved to database');
      
      return savedToken;
    } catch (error) {
      console.error('Error in createRefreshToken:', error);
      throw error;
    }
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
    user.lockedUntil = undefined;
    user.lastLoginAt = new Date();
    user.lastLoginIp = undefined;
    await this.userRepository.save(user);
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: {
        emailVerificationToken: token,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    if (user.emailVerificationExpires < new Date()) {
      throw new BadRequestException('Verification token has expired');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await this.userRepository.save(user);

    // Send welcome email
    await this.emailService.sendWelcomeEmail(user.email, user.firstName);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      // Don't reveal that the user doesn't exist
      return;
    }

    // Generate password reset token
    const passwordResetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetExpires = new Date();
    passwordResetExpires.setHours(passwordResetExpires.getHours() + 1); // 1 hour

    user.passwordResetToken = passwordResetToken;
    user.passwordResetExpires = passwordResetExpires;
    await this.userRepository.save(user);

    // Send password reset email
    await this.emailService.sendPasswordResetEmail(
      user.email,
      passwordResetToken,
      user.firstName,
    );
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: {
        passwordResetToken: token,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid reset token');
    }

    if (user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(
      newPassword,
      this.configService.get('bcrypt.rounds'),
    );

    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await this.userRepository.save(user);
  }

  async resendVerificationEmail(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Generate new verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date();
    emailVerificationExpires.setHours(emailVerificationExpires.getHours() + 24);

    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationExpires = emailVerificationExpires;
    await this.userRepository.save(user);

    // Send verification email
    await this.emailService.sendVerificationEmail(
      user.email,
      emailVerificationToken,
      user.firstName,
    );
  }
}