import { forwardRef, Module } from '@nestjs/common';
import { PersonController } from './person.controller';
import { PersonService } from './person.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Person } from '../entity/person.entity';
import { HouseholdService } from 'src/household/household.service';
import { Household } from 'src/entity/household.entity';
import { HouseholdModule } from 'src/household/household.module';

@Module({
  imports:[TypeOrmModule.forFeature([Household]), forwardRef(() => HouseholdModule)],
  controllers: [PersonController],
  providers: [PersonService],
  exports: [TypeOrmModule, PersonService]
})
export class PersonModule {}