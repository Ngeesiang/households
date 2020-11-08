import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { Person } from 'src/entity/person.entity';
import { HouseholdService } from '../household/household.service'

@Injectable()
export class PersonService {

    constructor(
        private connection: Connection,
        private householdService: HouseholdService
    ) {}

    async getAll(): Promise<Person[]> {
        const manager = this.connection.manager
        return await manager.find(Person)
    }

}
