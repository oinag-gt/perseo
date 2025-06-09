import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { EmailModule } from './email/email.module';
import { PeopleModule } from './people/people.module';
import configuration from './config/configuration';
import { TenantMiddleware } from './database/tenant.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: [
        '../../.env.local', // Root .env.local
        '.env.local',       // Local .env.local
        '.env',             // Local .env
      ],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        autoLoadEntities: true,
        synchronize: configService.get('NODE_ENV') === 'development', // Use synchronize in dev for now
        logging: configService.get('NODE_ENV') === 'development',
        // migrations: [__dirname + '/migrations/*{.ts,.js}'],
        // migrationsRun: true, // Run migrations automatically in development
      }),
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('redis.host'),
          port: configService.get('redis.port'),
          password: configService.get('redis.password'),
        },
      }),
    }),
    DatabaseModule,
    EmailModule,
    AuthModule,
    PeopleModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes('*');
  }
}