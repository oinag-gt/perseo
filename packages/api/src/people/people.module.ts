import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Person } from './entities/person.entity';
import { Group } from './entities/group.entity';
import { GroupMembership } from './entities/group-membership.entity';
import { Document } from './entities/document.entity';
import { PersonController } from './controllers/person.controller';
import { GroupController } from './controllers/group.controller';
import { MembershipController } from './controllers/membership.controller';
import { PersonService } from './services/person.service';
import { GroupService } from './services/group.service';
import { MembershipService } from './services/membership.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Person,
      Group, 
      GroupMembership,
      Document,
    ]),
    DatabaseModule,
  ],
  controllers: [
    PersonController,
    GroupController,
    MembershipController,
  ],
  providers: [
    PersonService,
    GroupService,
    MembershipService,
  ],
  exports: [
    PersonService,
    GroupService,
    MembershipService,
  ],
})
export class PeopleModule {}