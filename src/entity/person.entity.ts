import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { Household } from 'src/entity/household.entity';
import { GenderType, MaritalStatusType, OccupationType, HouseholdType } from './enum-types';
import { IsNumber, IsEnum, IsDate, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Person {

    @IsNumber()
    @PrimaryGeneratedColumn()
    id: number;

    @IsNumber()
    @ManyToOne(type => Household, household => household.id, {nullable: true, onDelete: "SET NULL"})
    household_unit: Household;

    @IsNumber()
    @Column({default: null})
    household_unit_id: number

    @IsString()
    @ApiProperty({'example': 'John', 'description': 'Name'})
    @Column()
    name: string;

    @IsEnum(['Male', 'Female', 'Others'])
    @ApiProperty({'example': 'Male', 'description': 'Gender'})
    @Column({ default: true })
    gender: GenderType;

    @IsEnum(['Single', 'Married'])
    @ApiProperty({'example': 'Single', 'description': 'Married'})
    @Column()
    marital_status: MaritalStatusType;

    @IsOptional()
    @IsNumber()
    @ApiProperty({'example': null, 'description': 'Spouse id'})
    @OneToOne(type => Person, person => person.id)
    @Column({default: null})
    spouse: number;

    @IsEnum(['Student', 'Employed', 'Unemployed'])
    @ApiProperty({'example': 'Student', 'description': 'Occupation Type'})
    @Column()
    occupation_type: OccupationType;

    @IsNumber()
    @ApiProperty({'example': 10000, 'description': 'Annual Income'})
    @Column()
    annual_income: number;

    @IsDate()
    @ApiProperty({'example': '01/01/1990', 'description': 'Housing unit'})
    @Column()
    date_of_birth: Date;

}