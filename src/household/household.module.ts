import { Module } from '@nestjs/common';
import { HouseholdService } from './household.service';
import { HouseholdController } from './household.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Household } from '../entity/household.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Household])],
  providers: [HouseholdService],
  controllers: [HouseholdController],
  exports: [TypeOrmModule]
})
export class HouseholdsModule {}
