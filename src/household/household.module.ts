import { forwardRef, Module } from '@nestjs/common';
import { HouseholdService } from './household.service';
import { HouseholdController } from './household.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonService } from 'src/person/person.service';
import { Person } from 'src/entity/person.entity';
import { PersonModule } from 'src/person/person.module';

@Module({
  imports:[TypeOrmModule.forFeature([Person]), forwardRef(() => PersonModule)],
  providers: [HouseholdService],
  controllers: [HouseholdController],
  exports: [TypeOrmModule, HouseholdService]
})
export class HouseholdModule {}
