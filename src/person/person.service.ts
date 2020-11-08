import { Injectable, NotFoundException } from '@nestjs/common';
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

    async findOne(person_id: number, is_spouse=false) {
        const manager = this.connection.manager
        try {
            return await manager.findOneOrFail(Person, person_id)
        } catch(err) {
            if (is_spouse) {
                throw new NotFoundException('Spouse indicated does not exist')
            }
            throw new NotFoundException('Person does not exist')
        }
    }

}
