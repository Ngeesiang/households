import { Controller, Get } from '@nestjs/common';
import { PersonService } from './person.service';
import { Person } from 'src/entity/person.entity';

@Controller('person')
export class PersonController {

    constructor(private personsService: PersonService) {}

    @Get()
    findAllPersons(): Promise<Person[]> {
      return this.personsService.getAll()
    }

}
