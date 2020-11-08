import { Controller, Body, Post, Get, Param, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiQuery } from '@nestjs/swagger';
import { HouseholdService } from './household.service';
import { Household } from 'src/entity/household.entity';

@Controller('household')
export class HouseholdController {

    constructor(private householdService: HouseholdService) {}

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
    getHouseholdsByHousehold_income(
        @Query('total_household_income') total_household_income: number,
        @Query('age') age: number,
        @Query('age_param') age_param: string,
        @Query('marital_status') marital_status: string): Promise<Household[]> {
        if (age_param == '-') {
            age = 0
            console.log(marital_status)
            if (marital_status == 'Non-requirement') {
                console.log("getHouseholdsByHouseholdIncome Function trigger")
                return this.householdService.getHouseholdsByHouseholdIncome(total_household_income)
            } else {
                console.log("getHouseholdsByHouseholdIncomeAndMaritalStatus Function trigger")
                return this.householdService.getHouseholdsByHouseholdIncomeAndMaritalStatus(total_household_income)
            }
        }

    }

    @Get('/:id')
    getOne(@Param("id") household_id: number): Promise<Household> {
        return this.householdService.findOne(household_id)
    }

    @Post()
    @ApiCreatedResponse({ description: 'The record has been successfully created.'})
    create(@Body() household: Household) {
        this.householdService.create(household)
    }

}
