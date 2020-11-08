import { Module } from '@nestjs/common';
import { PersonController } from './person.controller';
import { PersonService } from './person.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Person } from '../entity/person.entity';
import { HouseholdService } from 'src/household/household.service';

@Module({
  imports:[TypeOrmModule.forFeature([Person])],
  controllers: [PersonController],
  providers: [PersonService, HouseholdService],
  exports: [TypeOrmModule]
  
})
export class PersonsModule {}