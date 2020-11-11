import { Injectable, NotFoundException, ForbiddenException, forwardRef, Inject } from '@nestjs/common';
import { Connection } from 'typeorm';
import { Person } from 'src/entity/person.entity';
import { HouseholdService } from '../household/household.service'
import { MaritalStatusType } from 'src/entity/enum-types';
import { Household } from 'src/entity/household.entity';

@Injectable()
export class PersonService {

    constructor(
        private connection: Connection,
        @Inject(forwardRef(() => HouseholdService))
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
        try {
            return await this.connection.transaction(async transactionalEntityManager => {
                const personORM = transactionalEntityManager.create(Person, person)
                await transactionalEntityManager.save(personORM);
                const personId = transactionalEntityManager.getId(personORM)
                if (personORM.spouse) {
                    await transactionalEntityManager.update(Person, person.spouse, {spouse: personId, marital_status: MaritalStatusType.Married})
                    }
            })
        } catch(err) {
            throw new ForbiddenException("Error in creation of Person.")
        }
    }

    async update(person: Person) {
        const validate = await this.validation(person)
        const findPerson = await this.findOne(person.id)
        const household = await this.householdService.findOne(person.household_unit_id)
        if (person.household_unit_id == null) {
            throw new ForbiddenException("Person is not a family member of a household unit")
        }
        try {
            const manager = this.connection.manager
            return await manager.transaction(async () => {
                await manager.createQueryBuilder()
                    .relation(Household, "family_members")
                    .of(household)
                    .remove(person);
                await manager.createQueryBuilder()
                    .update(Person)
                    .where("household_unit_id = :household_id", { household_id: person.household_unit_id })
                    .andWhere("id = :person_id", {person_id: person.id})
                    .set({
                        id: person.id,
                        name: person.name,
                        gender: person.gender,
                        marital_status: person.marital_status,
                        spouse: person.spouse,
                        occupation_type: person.occupation_type,
                        annual_income: person.annual_income,
                        date_of_birth: person.date_of_birth,
                        household_unit_id: null
                    })
                    .execute()
            })
        } catch (err) {
            throw new ForbiddenException("Error in deletion of family member")
        }

    }
}
