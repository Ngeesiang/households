import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HouseholdController } from './household/household.controller';
import { HouseholdService } from './household/household.service';
import { HouseholdModule } from './household/household.module';
import { PersonController } from './person/person.controller';
import { PersonService } from './person/person.service';
import { PersonModule } from './person/person.module';

@Module({
  imports: [HouseholdModule, PersonModule],
  controllers: [AppController, HouseholdController, PersonController],
  providers: [AppService, HouseholdService, PersonService],
})
export class AppModule {}
