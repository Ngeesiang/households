import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HouseholdModule } from './household/household.module';
import { PersonModule } from './person/person.module';
import { Household } from './entity/household.entity';
import { Person } from './entity/person.entity';
import "reflect-metadata";


@Module({
  imports: [
    TypeOrmModule.forRoot(
      {
        "type": "postgres",
        "host": "localhost",
        "port": 5432,
        "username": "postgres",
        "password": "password",
        "database": "households",
        "entities": [Household, Person],
        "migrationsTableName": "migration_table",
        "migrations": ["migrations/*.{ts, js}"],
        "cli": {
            "migrationsDir": "migration"
        },
        "synchronize": true
      }
    ),
    HouseholdModule,
    PersonModule
  ],
    controllers: [AppController],
    providers: [AppService],
})

export class AppModule {}
