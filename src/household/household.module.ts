import { Module } from '@nestjs/common';
import { HouseholdService } from './household.service';
import { HouseholdController } from './household.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Household } from '../entity/household.entity';
import { PersonService } from 'src/person/person.service';
import { Person } from 'src/entity/person.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Person])],
  providers: [HouseholdService, PersonService],
  controllers: [HouseholdController],
  exports: [TypeOrmModule]
})
export class HouseholdModule {}
