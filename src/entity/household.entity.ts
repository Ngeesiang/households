import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Person } from 'src/entity/person.entity';
import { HouseholdType } from './enum-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsNumber } from "class-validator";

@Entity()
export class Household {

  @IsNumber()
  @PrimaryGeneratedColumn()
  id: number;

  @IsEnum(['Condominium', 'Landed', 'HDB'])
  @ApiProperty({enum: HouseholdType, 'description': 'Housing Type'})
  @Column()
  household_type: HouseholdType

  @OneToMany(type => Person, person => person.household_unit, {
    eager: true
  })
  @ApiProperty({'example': [], 'description': 'List of household members'})
  family_members: Person[];

  @IsNumber()
  @Column({default: true, select: false})
  is_active: boolean;
  
}


