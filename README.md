# NodeJS MySQL Typescript Boilerplate

A boilerplate for Node.js web applications using express, mysql and typescript

# Quick Start

## Prerequisites
1. NodeJs 14+ [link](https://nodejs.org/en/)
2. MySQL

## Installation
1. Clone the project `git clone `.
2. Install dependencies `npm i`.
3. Create a config.json file in src/config like the config.example.son file.
4. Create a free test account on https://ethereal.email/ and copy your settings to the SMTP settings in the config file.

## Scripts
You can run the following scripts with `npm run <script name>`:
- `dev` create the database if you run the project for the first time.
- `fixtures:load` load some data in the database.
- `fixtures:purge` drops the database.
- `build` compile files with typescript into a dist folder.
- `start` run nodemon from the dist folder.
- `test:unit` Run only the unit tests.

## Structure
```txt
|--__test__\
| |--unit\
| |--|--controllers\
| |--|--models\
| |--|--services\
| |--setup.ts
|--coverage\
|--dist\
|--src\
|--|--server.ts
|--|--_helpers\
|--|--config\
|--|--controllers\
|--|--database\
|--|--|--fixtures\
|--|--|--migrations\
|--|--|--seeders\
|--|--entities\
|--|--repositories\
|--|--routes\
|--|--services\
    .sequelizerc
    jest.config.js
    package.json
    tsconfig.json
```