import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<any> {
    try {
      console.log('LocalStrategy.validate called with email:', email);
      const user = await this.authService.validateUser(email, password);
      console.log('LocalStrategy.validate - user found:', !!user);
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
      return user;
    } catch (error) {
      console.error('LocalStrategy.validate error:', error);
      throw error;
    }
  }
}