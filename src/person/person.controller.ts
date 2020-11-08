import { Controller, Get, Post, Body, Param } from '@nestjs/common';
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

    @Get('/:id')
    findOnePerson(
      @Param('id') id: number): Promise<Person> {
      return this.personsService.findOne(id)
    }

    @Post()
    @ApiCreatedResponse({ description: 'The record has been successfully created.'})
    create(@Body() person: Person) {
        return this.personsService.create(person)
    }

}
