import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    const smtpConfig = {
      host: this.configService.get('email.host'),
      port: this.configService.get('email.port'),
      secure: this.configService.get('email.secure'), // true for 465, false for other ports
      auth: {
        user: this.configService.get('email.auth.user'),
        pass: this.configService.get('email.auth.pass'),
      },
      tls: {
        rejectUnauthorized: false,
      },
      // Additional options for Outlook/Office 365
      authMethod: 'PLAIN',
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,
    };

    console.log('SMTP Configuration:', {
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      user: smtpConfig.auth.user ? '***@' + smtpConfig.auth.user.split('@')[1] : 'NOT_SET',
      pass: smtpConfig.auth.pass ? 'SET' : 'NOT_SET',
    });

    this.transporter = nodemailer.createTransport(smtpConfig);
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    const mailOptions = {
      from: this.configService.get('email.from'),
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    try {
      console.log('Attempting to send email to:', options.to);
      console.log('Email from:', mailOptions.from);
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
    } catch (error) {
      console.error('Email send error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: (error as any).code,
        response: (error as any).response,
        responseCode: (error as any).responseCode,
      });
      throw new Error('Failed to send email');
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing SMTP connection...');
      await this.transporter.verify();
      console.log('SMTP connection successful');
      return true;
    } catch (error) {
      console.error('SMTP connection test failed:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: (error as any).code,
        response: (error as any).response,
      });
      return false;
    }
  }

  async sendVerificationEmail(email: string, token: string, firstName: string): Promise<void> {
    const verificationUrl = `${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}/verify-email?token=${token}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to PERSEO, ${firstName}!</h2>
        <p>Thank you for registering. Please verify your email address by clicking the link below:</p>
        <p style="margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
            Verify Email Address
          </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          If you didn't create an account, please ignore this email.
        </p>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Verify your PERSEO account',
      html,
      text: `Welcome to PERSEO! Please verify your email by visiting: ${verificationUrl}`,
    });
  }

  async sendPasswordResetEmail(email: string, token: string, firstName: string): Promise<void> {
    const resetUrl = `${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token=${token}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hi ${firstName},</p>
        <p>We received a request to reset your password. Click the link below to create a new password:</p>
        <p style="margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666; word-break: break-all;">${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          If you didn't request a password reset, please ignore this email. Your password won't be changed.
        </p>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Reset your PERSEO password',
      html,
      text: `Reset your password by visiting: ${resetUrl}`,
    });
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    const loginUrl = `${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}/login`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to PERSEO!</h2>
        <p>Hi ${firstName},</p>
        <p>Your email has been verified successfully. You can now access all features of PERSEO.</p>
        <p style="margin: 30px 0;">
          <a href="${loginUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
            Sign In to PERSEO
          </a>
        </p>
        <p>Need help getting started? Check out our documentation or contact support.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Welcome to PERSEO!',
      html,
      text: `Welcome to PERSEO! Your email has been verified. Sign in at: ${loginUrl}`,
    });
  }
}