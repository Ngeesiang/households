import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Connection } from 'typeorm';
import { Person } from 'src/entity/person.entity';
import { HouseholdService } from '../household/household.service'
import { MaritalStatusType } from 'src/entity/enum-types';

@Injectable()
export class PersonService {

    constructor(
        private connection: Connection,
        private householdService: HouseholdService
    ) {}

    async validation(person:Person) {
        const household_unit = await this.householdService.findOne(person.household_unit)
        if (person.spouse != null) {
            const spouse = await this.findOne(person.spouse, true)
            if (person.marital_status == 'Single') {
                throw new ForbiddenException("Marital status should be set to 'Married' if spouse_id is indicated")
            }
        }
        if (person.spouse == null) {
            if (person.marital_status == 'Married') {
                throw new ForbiddenException("Marital status should be set to 'Single' if spouse_id is not indicated")
            }
        }
    }

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

    async create(person: Person) {

        const validation = await this.validation(person)

        await this.connection.transaction(async manager => {
            const person_ORM = manager.create(Person, person)
            await manager.save(person_ORM);
            const personId = manager.getId(person_ORM)
            if (person_ORM.spouse) {
                await manager.update(Person, person.spouse, {spouse: personId, marital_status: MaritalStatusType.Married})
                }
            return personId
        })
    }

}
