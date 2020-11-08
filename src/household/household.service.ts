import { Injectable, NotFoundException } from '@nestjs/common';
import { Connection } from 'typeorm';
import { Household } from '../entity/household.entity';

@Injectable()
export class HouseholdService {

    constructor(private connection: Connection) {}

    async getAll(): Promise<Household[]> {
        const manager = this.connection.manager
        return await manager.find(Household)
    }

    async findOne(household_id: number): Promise<Household> {
        const manager = this.connection.manager
        try {
            return await manager.findOneOrFail(Household, household_id)
        } catch(err) {
            throw new NotFoundException('Household unit does not exist')
        }
    }

}
