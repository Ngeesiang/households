import { Controller, Get, Post, Body, Param, ForbiddenException, Res, HttpStatus } from '@nestjs/common';
import { PersonService } from './person.service';
import { Person } from 'src/entity/person.entity';
import { ApiCreatedResponse } from '@nestjs/swagger';

@Controller('person')
export class PersonController {

    constructor(private personsService: PersonService) {}

    @Get()
    findAllPersons(): Promise<Person[]> {
      return this.personsService.getAll()
    }

    @Get('/:person_id')
    findOnePerson(
      @Param('person_id') id: number): Promise<Person> {
      return this.personsService.findOne(id)
    }

    @Post()
    create(@Body() person: Person, @Res() res) {
        try {
          const create = this.personsService.create(person)
          return res.status(HttpStatus.OK).json({
            status: 200,
            message: "Person has been created.",
          });
        } catch(err) {
          throw new ForbiddenException(err)
        }
        
    }

}
