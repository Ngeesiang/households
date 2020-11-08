import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Connection } from 'typeorm';
import { Household } from '../entity/household.entity';
import { HouseholdType } from 'src/entity/enum-types';


@Injectable()
export class HouseholdService {

    constructor(private connection: Connection) {}

    validation(household: Household) {
        const household_types = HouseholdType
        if (household.household_type in household_types == false) {
            throw new ForbiddenException('Please indicate a household type available')
        }
    }

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

    async create(household: Household) {
        const validation = this.validation(household)
        await this.connection.transaction(async manager => {
            const household_ORM = manager.create(Household, household)
            return await manager.save(household_ORM);
        });
      }

    async getHouseholdsByHouseholdIncome(total_household_income=0): Promise<Household[]> {
        const manager = this.connection.manager
        const household_ids = await this.findHouseholdByIncome(total_household_income)
        var ids = []
        for(var variable in household_ids) {
            ids.push(household_ids[variable].id)
        }
        return await manager.findByIds(Household, ids)
    }

    async findHouseholdByIncome(total_household_income: number) {
        const manager = this.connection.manager
        return await manager.query(
            `
            SELECT HOUSEHOLD.ID, SUM(PERSON.ANNUAL_INCOME) AS HOUSEHOLD_INCOME FROM HOUSEHOLD
            INNER JOIN PERSON ON HOUSEHOLD.ID = PERSON.HOUSEHOLD_UNIT
            GROUP BY HOUSEHOLD.ID
            HAVING SUM(PERSON.ANNUAL_INCOME) < ${total_household_income}
            `
        )
    }

    async getHouseholdsByHouseholdIncomeAndMaritalStatus(total_household_income=0): Promise<Household[]> {
        const manager = this.connection.manager
        const household_ids = await this.findHouseholdByIncomeAndMaritalStatus(total_household_income)
        var ids = []
        for(var variable in household_ids) {
            ids.push(household_ids[variable].id)
        }
        return await manager.findByIds(Household, ids)
    }

    async findHouseholdByIncomeAndMaritalStatus(total_household_income: number) {
        const manager = this.connection.manager
        return await manager.query(
            `
            SELECT * FROM
            (SELECT HOUSEHOLD.ID, SUM(PERSON.ANNUAL_INCOME) AS HOUSEHOLD_INCOME FROM HOUSEHOLD
            INNER JOIN PERSON ON HOUSEHOLD.ID = PERSON.HOUSEHOLD_UNIT
            GROUP BY HOUSEHOLD.ID
            HAVING SUM(PERSON.ANNUAL_INCOME) < ${total_household_income}) 
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

    async getHouseholdsByHouseholdIncomeAndAge(total_household_income=0, age=0, age_param: string): Promise<Household[]> {
        const manager = this.connection.manager
        var household_ids;
        if (age_param == 'Less than') {
            household_ids = await this.findHouseholdByIncomeAndAge(total_household_income, age, "<", "MIN")
        } else {
            household_ids = await this.findHouseholdByIncomeAndAge(total_household_income, age, ">", "MAX")
        }
        var ids = []
        for(var variable in household_ids) {
            ids.push(household_ids[variable].id)
        }
        return await manager.findByIds(Household, ids)
    }

    async findHouseholdByIncomeAndAge(total_household_income: number, age: number, age_param: string, min_max: string): Promise<any[]> {
        console.log(age_param)
        console.log(min_max)
        const manager = this.connection.manager
        const curr_year = new Date().getFullYear()
        return await manager.query(
            `
            SELECT * FROM
            (SELECT HOUSEHOLD.ID, ${min_max}(${curr_year} - EXTRACT(YEAR FROM CAST(PERSON.DATE_OF_BIRTH AS DATE))) AS ${min_max}_AGE FROM HOUSEHOLD
            INNER JOIN PERSON ON HOUSEHOLD.ID = PERSON.HOUSEHOLD_UNIT
            GROUP BY HOUSEHOLD.ID
            HAVING ${min_max}(${curr_year} - EXTRACT(YEAR FROM CAST(PERSON.DATE_OF_BIRTH AS DATE))) ${age_param} ${age}) 
            AS AGE_TABLE
            INNER JOIN
            (SELECT HOUSEHOLD.ID, SUM(PERSON.ANNUAL_INCOME) AS HOUSEHOLD_INCOME FROM HOUSEHOLD
            INNER JOIN PERSON ON HOUSEHOLD.ID = PERSON.HOUSEHOLD_UNIT
            GROUP BY HOUSEHOLD.ID
            HAVING SUM(PERSON.ANNUAL_INCOME) < ${total_household_income})
            AS INCOME_TABLE
            ON AGE_TABLE.ID = INCOME_TABLE.ID
            `
        );
    }

    async getHouseholdsByHouseholdIncomeAndAgeAndMaritalStatus(total_household_income=0, age=0, age_param:string): Promise<Household[]> {
        const manager = this.connection.manager
        var household_ids;
        if (age_param == 'Less than') {
            household_ids = await this.findHouseholdByIncomeAndAgeAndMaritalStatus(total_household_income, age, "<", "MIN")
        } else {
            household_ids = await this.findHouseholdByIncomeAndAgeAndMaritalStatus(total_household_income, age, ">", "MAX")
        }
        var ids = []
        for(var variable in household_ids) {
            ids.push(household_ids[variable].id)
        }
        return await manager.findByIds(Household, ids)
        return await household_ids
    }

    async findHouseholdByIncomeAndAgeAndMaritalStatus(total_household_income: number, age: number, 
        age_param: string, min_max: string) {
        const manager = this.connection.manager
        const curr_year = new Date().getFullYear()
        return await manager.query(
            `
            SELECT * FROM
            ((SELECT HOUSEHOLD.ID AS INCOME_ID, SUM(PERSON.ANNUAL_INCOME) AS HOUSEHOLD_INCOME FROM HOUSEHOLD
            INNER JOIN PERSON ON HOUSEHOLD.ID = PERSON.HOUSEHOLD_UNIT
            GROUP BY HOUSEHOLD.ID
            HAVING SUM(PERSON.ANNUAL_INCOME) < ${total_household_income}) 
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
            (SELECT HOUSEHOLD.ID , ${min_max}(${curr_year} - EXTRACT(YEAR FROM CAST(PERSON.DATE_OF_BIRTH AS DATE))) AS ${min_max}_AGE FROM HOUSEHOLD
            INNER JOIN PERSON ON HOUSEHOLD.ID = PERSON.HOUSEHOLD_UNIT
            GROUP BY HOUSEHOLD.ID
            HAVING ${min_max}(${curr_year} - EXTRACT(YEAR FROM CAST(PERSON.DATE_OF_BIRTH AS DATE))) ${age_param} ${age})
            AS AGE_TABLE
            ON INTERIM_TABLE.INCOME_ID = AGE_TABLE.ID
            `
        )

        }

}
