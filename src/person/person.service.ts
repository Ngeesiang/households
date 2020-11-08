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
    // Validate that if a spouse is indicated, the person is an existing person
    // Validate that if a spouse is indicated, the marital status must be 'Married' and vice versa
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
    // Get all persons in db
        const manager = this.connection.manager
        return await manager.find(Person)
    }

    async findOne(personId: number, isSpouse=false) {
    // Find a person by person.id
    // If is_spouse == true, find person and throw 'Spouse indicated does not exist' error msg if not found
    // If is_spouse == false, find person and throw 'Person does not exist' error msg if not found
        const manager = this.connection.manager
        try {
            return await manager.findOneOrFail(Person, personId)
        } catch(err) {
            if (isSpouse) {
                throw new NotFoundException('Spouse indicated does not exist')
            }
            throw new NotFoundException('Person does not exist')
        }
    }

    async create(person: Person) {
    // Create a person with no housing unit
    // If spouse is indicated, entity manager updates the spouse's spouse and marital status column
        const validation = await this.validation(person)

        await this.connection.transaction(async transactionalEntityManager => {
            const personORM = transactionalEntityManager.create(Person, person)
            await transactionalEntityManager.save(personORM);
            const personId = transactionalEntityManager.getId(personORM)
            if (personORM.spouse) {
                await transactionalEntityManager.update(Person, person.spouse, {spouse: personId, marital_status: MaritalStatusType.Married})
                }
            return personId
        })
    }

}
