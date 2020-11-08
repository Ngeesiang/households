import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Connection } from 'typeorm';
import { Household } from '../entity/household.entity';
import { HouseholdType } from 'src/entity/enum-types';
import { Person } from 'src/entity/person.entity';
import { PersonService } from 'src/person/person.service';


@Injectable()
export class HouseholdService {

    constructor(private connection: Connection,
        private personService: PersonService) {}

    validation(household: Household) {
    // Validate that the household_type in input exists in Enum HouseholdType
        const householdTypes = HouseholdType
        if (household.household_type in householdTypes == false) {
            throw new ForbiddenException('Please indicate a household type available')
        }
    }

    async getAll(): Promise<Household[]> {
    // Get all existing households with their respective family members
        const manager = this.connection.manager
        return await manager.find(Household, { is_active: true })
    }

    async findOne(householdId: number): Promise<Household> {
    // Retrieve one household by household_id
        const manager = this.connection.manager
        try {
            return await manager.findOneOrFail(Household, { id: householdId, is_active: true })
        } catch(err) {
            throw new NotFoundException('Household unit does not exist')
        }
    }

    async create(household: Household) {
    // Create a household with no family members
        const validation = this.validation(household)
        await this.connection.transaction(async manager => {
            const householdORM = manager.create(Household, household)
            return await manager.save(householdORM);
        });
      }

    async getHouseholdsByHouseholdIncome(totalHouseholdIncome=0): Promise<Household[]> {
    // Find households with household_income < total_household_income
        const manager = this.connection.manager
        const householdIds = await this.findHouseholdByIncome(totalHouseholdIncome)
        var ids = []
        for(var variable in householdIds) {
            ids.push(householdIds[variable].id)
        }
        return await manager.findByIds(Household, ids, {is_active: true})
    }

    async findHouseholdByIncome(totalHouseholdIncome: number) {
    // SQL query to select household.ids with household_income < total_household_income
        const manager = this.connection.manager
        return await manager.query(
            `
            SELECT HOUSEHOLD.ID, SUM(PERSON.ANNUAL_INCOME) AS HOUSEHOLD_INCOME FROM HOUSEHOLD
            WHERE HOUSEHOLD.IS_ACTIVE = TRUE
            INNER JOIN PERSON ON HOUSEHOLD.ID = PERSON.HOUSEHOLD_UNIT
            GROUP BY HOUSEHOLD.ID
            HAVING SUM(PERSON.ANNUAL_INCOME) < ${totalHouseholdIncome}
            `
        )
    }

    async getHouseholdsByHouseholdIncomeAndMaritalStatus(totalHouseholdIncome=0): Promise<Household[]> {
    // Find households with household_income < total_household_income and has a married couple
        const manager = this.connection.manager
        const householdIds = await this.findHouseholdByIncomeAndMaritalStatus(totalHouseholdIncome)
        var ids = []
        for(var variable in householdIds) {
            ids.push(householdIds[variable].id)
        }
        return await manager.findByIds(Household, ids, {is_active: true})
    }

    async findHouseholdByIncomeAndMaritalStatus(totalHouseholdIncome: number) {
    // SQL query to select household.ids with household_income < total_household_income
    // intersect
    // SQL query to select household.ids with two persons in the household married to each other
        const manager = this.connection.manager
        return await manager.query(
            `
            SELECT * FROM
            (SELECT HOUSEHOLD.ID, SUM(PERSON.ANNUAL_INCOME) AS HOUSEHOLD_INCOME FROM HOUSEHOLD
            INNER JOIN PERSON ON HOUSEHOLD.ID = PERSON.HOUSEHOLD_UNIT
            GROUP BY HOUSEHOLD.ID
            HAVING SUM(PERSON.ANNUAL_INCOME) < ${totalHouseholdIncome}) 
            AS INCOME_TABLE
            INNER JOIN
            (SELECT HOUSEHOLD.ID FROM HOUSEHOLD 
            INNER JOIN PERSON ON HOUSEHOLD.ID = PERSON.HOUSEHOLD_UNIT
            WHERE EXISTS (
                SELECT 1
                FROM PERSON AS PERSON1, PERSON AS PERSON2
                WHERE PERSON1.HOUSEHOLD_UNIT = HOUSEHOLD.ID 
                AND PERSON1.HOUSEHOLD_UNIT = PERSON2.HOUSEHOLD_UNIT
                AND PERSON1.ID <> PERSON2.ID
                AND PERSON1.SPOUSE=PERSON2.ID 
                AND PERSON2.SPOUSE=PERSON1.ID
                
            )) 
            AS MARITAL_TABLE
            ON INCOME_TABLE.ID = MARITAL_TABLE.ID
            `
        )
    }

    async getHouseholdsByHouseholdIncomeAndAge(totalHouseholdIncome=0, age=0, ageParam: string): Promise<Household[]> {
    // Find households with household_income < total_household_income and with a family member with age
    // > age_given or age > age_given
        const manager = this.connection.manager
        var householdIds;
        if (ageParam == 'Less than') {
            householdIds = await this.findHouseholdByIncomeAndAge(totalHouseholdIncome, age, "<", "MIN")
        } else {
            householdIds = await this.findHouseholdByIncomeAndAge(totalHouseholdIncome, age, ">", "MAX")
        }
        var ids = []
        for(var variable in householdIds) {
            ids.push(householdIds[variable].id)
        }
        return await manager.findByIds(Household, ids, {is_active: true})
    }

    async findHouseholdByIncomeAndAge(totalHouseholdIncome: number, age: number, ageParam: string, minMax: string): Promise<any[]> {
    // SQL query to select household.ids with household_income < total_household_income
    // intersect
    // SQL query to select household.ids with age < age_given or age > age_given
        const manager = this.connection.manager
        const currYear = new Date().getFullYear()
        return await manager.query(
            `
            SELECT * FROM
            (SELECT HOUSEHOLD.ID, ${minMax}(${currYear} - EXTRACT(YEAR FROM CAST(PERSON.DATE_OF_BIRTH AS DATE))) AS ${minMax}_AGE FROM HOUSEHOLD
            INNER JOIN PERSON ON HOUSEHOLD.ID = PERSON.HOUSEHOLD_UNIT
            GROUP BY HOUSEHOLD.ID
            HAVING ${minMax}(${currYear} - EXTRACT(YEAR FROM CAST(PERSON.DATE_OF_BIRTH AS DATE))) ${ageParam} ${age}) 
            AS AGE_TABLE
            INNER JOIN
            (SELECT HOUSEHOLD.ID, SUM(PERSON.ANNUAL_INCOME) AS HOUSEHOLD_INCOME FROM HOUSEHOLD
            INNER JOIN PERSON ON HOUSEHOLD.ID = PERSON.HOUSEHOLD_UNIT
            GROUP BY HOUSEHOLD.ID
            HAVING SUM(PERSON.ANNUAL_INCOME) < ${totalHouseholdIncome})
            AS INCOME_TABLE
            ON AGE_TABLE.ID = INCOME_TABLE.ID
            `
        );
    }

    async getHouseholdsByHouseholdIncomeAndAgeAndMaritalStatus(totalHouseholdIncome=0, age=0, ageParam:string): Promise<Household[]> {
    // Find households with household_income < total_household_income and 
    // with a family member with age > age_given or age > age_given
    // with a married couple
        const manager = this.connection.manager
        var householdIds;
        if (ageParam == 'Less than') {
            householdIds = await this.findHouseholdByIncomeAndAgeAndMaritalStatus(totalHouseholdIncome, age, "<", "MIN")
        } else {
            householdIds = await this.findHouseholdByIncomeAndAgeAndMaritalStatus(totalHouseholdIncome, age, ">", "MAX")
        }
        var ids = []
        for(var variable in householdIds) {
            ids.push(householdIds[variable].id)
        }
        return await manager.findByIds(Household, ids, {is_active: true})

    }

    async findHouseholdByIncomeAndAgeAndMaritalStatus(totalHouseholdIncome: number, age: number, 
        ageParam: string, minMax: string) {
    // SQL query to select household.ids with household_income < total_household_income
    // intersect
    // SQL query to select household.ids with age < age_given or age > age_given
    // intersect
    // SQL to select household.ids with a married couple in the housing unit
        const manager = this.connection.manager
        const currYear = new Date().getFullYear()
        return await manager.query(
            `
            SELECT * FROM
            ((SELECT HOUSEHOLD.ID AS INCOME_ID, SUM(PERSON.ANNUAL_INCOME) AS HOUSEHOLD_INCOME FROM HOUSEHOLD
            INNER JOIN PERSON ON HOUSEHOLD.ID = PERSON.HOUSEHOLD_UNIT
            GROUP BY HOUSEHOLD.ID
            HAVING SUM(PERSON.ANNUAL_INCOME) < ${totalHouseholdIncome}) 
            AS INCOME_TABLE
            INNER JOIN
            (SELECT HOUSEHOLD.ID FROM HOUSEHOLD 
            INNER JOIN PERSON ON HOUSEHOLD.ID = PERSON.HOUSEHOLD_UNIT
            WHERE EXISTS (
                SELECT 1
                FROM PERSON AS PERSON1, PERSON AS PERSON2
                WHERE PERSON1.HOUSEHOLD_UNIT = HOUSEHOLD.ID 
                AND PERSON1.HOUSEHOLD_UNIT = PERSON2.HOUSEHOLD_UNIT
                AND PERSON1.ID <> PERSON2.ID
                AND PERSON1.SPOUSE=PERSON2.ID 
                AND PERSON2.SPOUSE=PERSON1.ID
            ))
            AS MARITAL_TABLE
            ON INCOME_TABLE.INCOME_ID = MARITAL_TABLE.ID)
            AS INTERIM_TABLE
            INNER JOIN
            (SELECT HOUSEHOLD.ID , ${minMax}(${currYear} - EXTRACT(YEAR FROM CAST(PERSON.DATE_OF_BIRTH AS DATE))) AS ${minMax}_AGE FROM HOUSEHOLD
            INNER JOIN PERSON ON HOUSEHOLD.ID = PERSON.HOUSEHOLD_UNIT
            GROUP BY HOUSEHOLD.ID
            HAVING ${minMax}(${currYear} - EXTRACT(YEAR FROM CAST(PERSON.DATE_OF_BIRTH AS DATE))) ${ageParam} ${age})
            AS AGE_TABLE
            ON INTERIM_TABLE.INCOME_ID = AGE_TABLE.ID
            `
        )

        }

    async delete(householdId: number) {
        const manager = this.connection.manager
        try {
            return await manager.transaction(async transactionalEntityManager => {
                const household = await this.findOne(householdId)
                await transactionalEntityManager.createQueryBuilder()
                    .relation(Person, "household_unit")
                    .of(household) // you can use just post id as well
                    .set(null);
                console.log('transaction done')
                await transactionalEntityManager.update(Household, householdId, { is_active: false });
            });
        } catch(err) {
            throw new NotFoundException('Error in deletion')
        }
        
    }

    async addFamilyMember(householdId: number, personId: number) {
        const manager = this.connection.manager
        try {
            const validatePerson = await this.personService.findOne(personId)
            const validateHousehold = await this.findOne(householdId)
            return await manager.createQueryBuilder()
            .relation(Household, "family_members")
            .of(householdId)
            .add(personId)
        } catch (err) {
            throw new ForbiddenException("Error in addition of family member")
        }
    }
}
