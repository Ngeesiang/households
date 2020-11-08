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

}
