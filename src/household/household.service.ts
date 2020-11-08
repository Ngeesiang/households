import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { Household } from '../entity/household.entity';

@Injectable()
export class HouseholdService {

    constructor(private connection: Connection) {}

    async getAll(): Promise<Household[]> {
        const manager = this.connection.manager
        return await manager.find(Household)
    }

}
