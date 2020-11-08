import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HouseholdsModule } from './household/household.module';
import { PersonsModule } from './person/person.module';
import { Household } from './entity/household.entity';
import { Person } from './entity/person.entity';


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
    HouseholdsModule,
    PersonsModule
  ],
    controllers: [AppController],
    providers: [AppService],
})

export class AppModule {}
