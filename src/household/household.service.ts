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

}
