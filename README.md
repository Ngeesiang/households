## Description

Household API Service

## Creation of local database

Nestjs supports MySQL, Postgres, sqlite, mongodb. Default in main.ts settings is postgres.
Change the db variables in app.module.ts to your own personal setting.
type: <database_type>,
host: <host_name>,
port: <port_number>,
username: <user_name_authorised_to_access_db>,
password: <password>,
database: <name_of_dataabase>

For Postgres:
Create database using 'CREATE DATABASE <NAME_OF_DATABASE> ;'

## Installation

```bash
$ npm i -g npm
$ npm install
$ npm i -g @nestjs/cli
```


## Running the app on localhost:3000

```bash
$ nest start
```

Open Chrome and go to 'localhost:3000/api/'


## General flow

Create empty household -> create person with no household_unit -> add person to family household

## Assumptions

Household creation:
Household is created with household_type but empty

Person creation:
Assume that when a spouse is indicated, the spouse must exist -> Adding person with spouse will update the spouse record to married and spouseId to id of added person

Person deletion:
Person is removed from the household and foreignkey household_unit is set to null. Person still exists in the database and can be added to another household

Househld deletion:
Household record is deleted from the database. Every person in the deleted household still exist in the database with foreign key household_unit set to null.


## API endpoints explanation

### Person

#### GET()
Get all Persons

#### GET('/:person_id')
Get a by person_id

#### POST()
Create a person with household_unit_id defaulted to null

#### DELETE()
Delete a person from household unit, setting household_unit_id to null

### Household

#### GET()
Get all household

#### GET('/:household_id')
Get a household by household_id

#### GET('/grants/')
Get all households eligible for grants

#### POST()
Create a household with no family members

#### POST(':/household_id)
Add an existing person to a household unit given person_id and household_id

#### DELETE()
Delete a household instance and setting all family members' household_unit_id to null
