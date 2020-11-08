import { Controller, Body, Post, Get, Param, Query, Delete } from '@nestjs/common';
import { ApiCreatedResponse, ApiQuery } from '@nestjs/swagger';
import { HouseholdService } from './household.service';
import { Household } from 'src/entity/household.entity';
import { PersonService } from 'src/person/person.service';

@Controller('household')
export class HouseholdController {

    constructor(private householdService: HouseholdService,
        private personService: PersonService) {}

    @Get()
    getAll(): Promise<Household[]> {
        return this.householdService.getAll()
    }

    @Get('/grants/')
    @ApiQuery({
        name: "total_household_income",
        required: false,
        type: Number,
      })
    @ApiQuery({
        name: "age",
        required: false,
        type: Number,
      })
    @ApiQuery({
        name: "age_param",
        required: true,
        enum: ['-', 'Less than', 'More than'],
        type: String,
      })
    @ApiQuery({
        name: "marital_status",
        required: true,
        enum: ['Married', 'Non-requirement'],
      })
    getHouseholdsByHouseholdIncome(
        @Query('total_household_income') totalHouseholdIncome: number,
        @Query('age') age: number,
        @Query('age_param') ageParam: string,
        @Query('marital_status') maritalStatus: string): Promise<Household[]> {
        if (ageParam == '-') {
            age = 0
            console.log(maritalStatus)
            if (maritalStatus == 'Non-requirement') {
                console.log("getHouseholdsByHouseholdIncome Function trigger")
                return this.householdService.getHouseholdsByHouseholdIncome(totalHouseholdIncome)
            } else {
                console.log("getHouseholdsByHouseholdIncomeAndMaritalStatus Function trigger")
                return this.householdService.getHouseholdsByHouseholdIncomeAndMaritalStatus(totalHouseholdIncome)
            }
        } else {
            if (maritalStatus == 'Non-requirement') {
                console.log("getHouseholdsByHouseholdIncomeAndAge Function trigger")
                return this.householdService.getHouseholdsByHouseholdIncomeAndAge(totalHouseholdIncome, age, ageParam)
            }
            console.log("getHouseholdsByHouseholdIncomeAndAgeAndMaritalStatus Function trigger")
            return this.householdService.getHouseholdsByHouseholdIncomeAndAgeAndMaritalStatus(totalHouseholdIncome, age, ageParam)
        }

    }

    @Get('/:id')
    getOne(@Param("id") householdId: number): Promise<Household> {
        return this.householdService.findOne(householdId)
    }

    @Post('/:id/add_family_member')
    @ApiCreatedResponse({ description: 'Person has been added the household.'})
    addFamilyMember(@Param("id") householdId: number,
    @Query("person_id") personId: number) {
        const validate = this.personService.findOne(personId)
        return this.householdService.addFamilyMember(householdId, personId)
    }

    @Post()
    @ApiCreatedResponse({ description: 'The record has been successfully created.'})
    create(@Body() household: Household) {
        return this.householdService.create(household)
    }

    @Delete('/:id')
    delete(@Param("id") householdId: number ){
        return this.householdService.delete(householdId)
    }

}
