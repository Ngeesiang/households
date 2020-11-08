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

}
