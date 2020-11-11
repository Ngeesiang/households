import { Controller, Body, Post, Get, Param, Query, Delete, Res, HttpStatus, ForbiddenException } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { HouseholdService } from './household.service';
import { Household } from 'src/entity/household.entity';

@Controller('household')
export class HouseholdController {

    constructor(private householdService: HouseholdService) {}

    @ApiOperation({ summary: 'Get all households' })
    @Get()
    async getAll(): Promise<Household[]> {
        return await this.householdService.getAll()
    }

    @ApiOperation({ summary: 'Get all households eligible for grants' })
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
    async getHouseholdsByHouseholdIncome(
        @Query('total_household_income') totalHouseholdIncome: number,
        @Query('age') age: number,
        @Query('age_param') ageParam: string,
        @Query('marital_status') maritalStatus: string): Promise<Household[]> {
        if (age < 0 || totalHouseholdIncome < 0) {
            throw new ForbiddenException("Please enter positive inputs.")
        }
        else {
            if (ageParam == '-') {
                age = 0
                if (maritalStatus == 'Non-requirement') {
                    return await this.householdService.getHouseholdsByHouseholdIncome(totalHouseholdIncome)
                } else {
                    return await this.householdService.getHouseholdsByHouseholdIncomeAndMaritalStatus(totalHouseholdIncome)
                }
            } else {
                if (maritalStatus == 'Non-requirement') {
                    return await this.householdService.getHouseholdsByHouseholdIncomeAndAge(totalHouseholdIncome, age, ageParam)
                }
                return await this.householdService.getHouseholdsByHouseholdIncomeAndAgeAndMaritalStatus(totalHouseholdIncome, age, ageParam)
            }
        }
    }

    @ApiOperation({ summary: 'Get households by household_id' })
    @Get('/:household_id')
    getOne(@Param("household_id") householdId: number): Promise<Household> {
        return this.householdService.findOne(householdId)
    }

    @ApiOperation({ summary: 'Add an existing person to a household unit' })
    @Post('/:household_id')
    async addFamilyMember(@Param("household_id") householdId: number,
        @Query("person_id") personId: number,
        @Res() res) {
        const addition = await this.householdService.addFamilyMember(householdId, personId)
        return res.status(HttpStatus.OK).json({
            status: 200,
            message: "Person added to household",
            });
    }

    @ApiOperation({ summary: 'Create a household unit with no family members' })
    @Post()
    async create(@Body() household: Household, @Res() res) {
        const creation = await this.householdService.create(household)
        return res.status(HttpStatus.CREATED).json({
            status: 201,
            message: "Household has been created with no family members.",
            });
    }

    @ApiOperation({ summary: 'Delete a household unit and set family members\' household_unit_id to null' })
    @Delete('/:household_id')
    async delete(@Param("household_id") householdId: number, @Res() res){
        const deletion = await this.householdService.delete(householdId)
        return res.status(HttpStatus.OK).json({
            status: 200,
            message: "Household has been deleted",
          });
        
    }

}
