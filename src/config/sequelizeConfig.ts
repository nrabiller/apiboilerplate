import { Sequelize } from 'sequelize';
import * as config from './config.json';
import mysql from 'mysql2/promise';

const { host, port, user, password, dbname } = config.database[process.env.NODE_ENV];
const connection = mysql.createConnection({ host, port, user, password });
connection.then((connection) => {
    connection.query(`CREATE DATABASE IF NOT EXISTS ${dbname}`);
    console.log(`${dbname} user: ${user} port: ${port}`);
    connection.end()
});
const sequelize = new Sequelize(
    dbname, user, password, {
    host,
    port,
    dialect: 'mysql',
    logging: false,
});

sequelize
    .authenticate()
    .then(() => {
        console.log('Connection to mysql has been established successfully');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

export default sequelize;
