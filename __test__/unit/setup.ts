import { afterAll, afterEach, beforeAll } from '@jest/globals';
import sequelize from '../../src/config/sequelizeConfig';
import server from '../../src/server';

beforeAll(async () => {
    await new Promise((resolve) => {
        resolve(sequelize.sync({ force: true }));
    });
});

afterEach(() => {
    server.close();
})

afterAll(async () => {
    await new Promise((resolve) => {
        resolve(sequelize.close());
    });
});
