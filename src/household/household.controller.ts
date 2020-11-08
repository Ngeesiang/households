import { Controller, Body, Post, Get, Param, Query, Delete, Res, HttpStatus, ForbiddenException } from '@nestjs/common';
import { ApiCreatedResponse, ApiQuery } from '@nestjs/swagger';
import { HouseholdService } from './household.service';
import { Household } from 'src/entity/household.entity';
import { PersonService } from 'src/person/person.service';

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
    getHouseholdsByHouseholdIncome(
        @Query('total_household_income') totalHouseholdIncome: number,
        @Query('age') age: number,
        @Query('age_param') ageParam: string,
        @Query('marital_status') maritalStatus: string): Promise<Household[]> {
        if (ageParam == '-') {
            age = 0
            if (maritalStatus == 'Non-requirement') {
                return this.householdService.getHouseholdsByHouseholdIncome(totalHouseholdIncome)
            } else {
                return this.householdService.getHouseholdsByHouseholdIncomeAndMaritalStatus(totalHouseholdIncome)
            }
        } else {
            if (maritalStatus == 'Non-requirement') {
                return this.householdService.getHouseholdsByHouseholdIncomeAndAge(totalHouseholdIncome, age, ageParam)
            }
            return this.householdService.getHouseholdsByHouseholdIncomeAndAgeAndMaritalStatus(totalHouseholdIncome, age, ageParam)
        }

    }

    @Get('/:household_id')
    getOne(@Param("household_id") householdId: number): Promise<Household> {
        return this.householdService.findOne(householdId)
    }

    @Post('/:household_id/add_family_member')
    async addFamilyMember(@Param("household_id") householdId: number,
        @Query("person_id") personId: number,
        @Res() res) {
        const addition = await this.householdService.addFamilyMember(householdId, personId)
        return res.status(HttpStatus.OK).json({
            status: 200,
            message: "Person added to household",
            });
    }

    @Post()
    async create(@Body() household: Household, @Res() res) {
        const creation = await this.householdService.create(household)
        return res.status(HttpStatus.CREATED).json({
            status: 201,
            message: "Household has been created with no family members.",
            });
    }

    @Delete('/:household_id')
    async delete(@Param("household_id") householdId: number, @Res() res){
        const deletion = await this.householdService.delete(householdId)
        return res.status(HttpStatus.OK).json({
            status: 200,
            message: "Household has been deleted",
          });
        
    }

}
