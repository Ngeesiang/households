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


## API endpoints

### Person

#### GET()
Get all Persons

#### GET('/:person_id')
Get a by person_id

#### POST()
Create a person with household_unit_id defaulted to null

#### DELETE
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

#### DELETE
Delete a household instance and setting all family members' household_unit_id to null
