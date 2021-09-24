import { expect, it, describe } from '@jest/globals';
import supertest from 'supertest';
import bcrypt from 'bcryptjs';
import User from '../../../src/entities/user';
import { UserRepository } from '../../../src/repositories/UserRepository';
import server from '../../../src/server';
import { authService } from '../../../src/services/UserService';

const baseUrl = '/api/v1';

describe('UserController', () => {
    describe('User Signup', () => {
        it('should return a response in json with a status 201 when a user signup', async (done) => {
            const data = {
                username: 'Anemonasc',
                lastname: 'Conner',
                firstname: 'Genaro',
                email: 'genaroconner@mail.com',
                password: 'KP>$62E@tWC*3/R9'
            };
         
            supertest(server)
                .post(`${baseUrl}/users/signup`)
                .set('Accept', 'application/json')
                .send(data)
                .end(function(err, res) {
                    if (err) return done(err);
                    const { status, body } = res;

                    expect(body.user.username).toBe(data.username);
                    expect(body.user.lastname).toBe(data.lastname);
                    expect(body.user.firstname).toBe(data.firstname);
                    expect(body.user.email).toBe(data.email);
                    expect(status).toEqual(201);
                    return done();
            });
        });
    
        it('should return a response in json with a status 400 when a user signup with an existing email or username', async (done) => {
            const data = {
                username: 'Geomamovi',
                lastname: 'Flores',
                firstname: 'Sean',
                email: 'genaroconner@mail.com',
                password: 'mzZM!3OC&~[o5^$D'
            };
    
            const data2 = {
                username: 'Anemonasc',
                lastname: 'Flores',
                firstname: 'Sean',
                email: 'seanflores@mail.com',
                password: 'mzZM!3OC&~[o5^$D'
            };
    
            supertest(server)
                .post(`${baseUrl}/users/signup`)
                .set('Accept', 'application/json')
                .send(data)
                .end(function(err, res) {
                    if (err) return done(err);
                    const { status, body } = res;

                    expect(body.error).toBe('email already used');
                    expect(status).toEqual(400);
                    return done();
            });
    
            supertest(server)
                .post(`${baseUrl}/users/signup`)
                .set('Accept', 'application/json')
                .send(data2)
                .end(function(err, res) {
                    if (err) return done(err);
                    const { status, body } = res;
                    
                    expect(body.error).toBe('username already used');
                    expect(status).toEqual(400);
                    return done();
            });
        });
    });
    
    describe('User login', () => {
        it('should sign in a user with good credentials', async (done) => {
            const user = {
                username: 'Wackyphor',
                firstname: 'Sal',
                lastname: 'Williamson',
                email: 'samwilliamson@mail.com',
                password: '%RsFSu7LZt;]6odH'
            };

            await User.create(user);

            supertest(server)
                .post(`${baseUrl}/users/login`)
                .set('Accept', 'application/json')
                .send(user)
                .end(function(err, res) {
                    if (err) return done(err);
                    const { status, body } = res;

                    expect(body.token.split(' ')[0]).toBe('JWT');
                    expect(status).toEqual(200);
                    return done();
            });
        });
    });
    
    describe('User getAll', () => {
        it('should return a response in json with a status 200 and a list of users when a user signup', async (done) => {
            supertest(server)
                .get(`${baseUrl}/users`)
                .set('Accept', 'application/json')
                .end(function(err, res) {
                    if (err) return done(err);
                    const { status, body } = res;

                    expect(status).toEqual(200);
                    expect(body.sucess).toBe(true);
                    expect(body.users[0].email).toBe('genaroconner@mail.com');
                    expect(body.users[0].firstname).toBe('Genaro');
                    expect(body.users[0].lastname).toBe('Conner');
                    expect(body.users[0].username).toBe('Anemonasc');
                    return done();
            });
        });
    });
    
    describe('User forgotPassword', () => {
        it('should send a mail with a link to reset the password', async (done) => {
            const user = {
                email: 'genaroconner@mail.com',
                password: 'KP>$62E@tWC*3/R9'
            };

            supertest(server)
                .post(`${baseUrl}/users/forgot-password`)
                .set('Accept', 'application/json')
                .send({ email: user.email })
                .end(function(err, res) {
                    if (err) return done(err);
                    const { status } = res;

                    expect(status).toEqual(200);
                    return done();
            });
        });
    });

    describe('User editPassword', () => {
        it('should edit the password of the identified user in the token', async (done) => {
            const data = {
                email: 'genaroconner@mail.com',
                password: 'KP>$62E@tWC*3/R9'
            };
            const token = await authService(data);
            const user = await UserRepository.findByEmail(data.email);

            supertest(server)
                .put(`${baseUrl}/users/${user.id}/${token}`)
                .set('Accept', 'application/json')
                .send({ password: '@newPassword1' })
                .end(function(err, res) {
                    if (err) return done(err);
                    const { status, body } = res;

                    expect(bcrypt.compareSync('@newPassword1', body.user.password)).toBe(true);
                    expect(status).toEqual(201);
                    return done();
            });
        });
    });
    
    describe('Edit user', () => {
        it('should allow an authentified user to edit his profile', async (done) => {
            const user = {
                email: 'genaroconner@mail.com',
                password: '@newPassword1'
            };
            const userEdited = {
                username: 'Csanomena',
                lastname: 'Rennoc',
                firstname: 'Oraneg',
                email: 'csanomenaoraneg@mail.com'
            };
            const token = await authService(user);

            supertest(server)
                .put(`${baseUrl}/users/1`)
                .set('Accept', 'application/json')
                .set('Authorization', token)
                .send(userEdited)
                .end(function(err, res) {
                    if (err) return done(err);
                    const { status, body } = res;
                    expect(status).toEqual(201);
                    expect(body.user.username).toBe(userEdited.username);
                    expect(body.user.lastname).toBe(userEdited.lastname);
                    expect(body.user.firstname).toBe(userEdited.firstname);
                    expect(body.user.email).toBe(userEdited.email);
                    return done();
            });
        });
    
        it('should allow an admin to edit a user', async (done) => {
            const admin = {
                email: 'admin@admin.com',
                password: 'verysercuredpassword',
                firstname: 'admin',
                lastname: 'admin',
                username: 'admin',
                role: 'admin'
            };
            const userEdited = {
                username: 'Csanomena',
                lastname: 'Rennoc',
                firstname: 'Oraneg',
                email: 'csanomenaoraneg@mail.com'
            };
            await User.create(admin);
            const token = await authService(admin);
        
            supertest(server)
                .put(`${baseUrl}/users/1`)
                .set('Accept', 'application/json')
                .set('Authorization', token)
                .send(userEdited)
                .end(function(err, res) {
                    if (err) return done(err);
                    const { status, body } = res;
                    expect(status).toEqual(201);
                    expect(body.user.username).toBe(userEdited.username);
                    expect(body.user.lastname).toBe(userEdited.lastname);
                    expect(body.user.firstname).toBe(userEdited.firstname);
                    expect(body.user.email).toBe(userEdited.email);
                    return done();
            });
        });
    
        it('should not allow a user to be edited without being authentified', async (done) => {
            const user = {
                email: 'genaroconner@mail.com',
                password: 'newPassword'
            };
            const userEdited = {
                username: 'Csanomena',
                lastname: 'Rennoc',
                firstname: 'Oraneg',
                email: 'csanomenaoraneg@mail.com'
            };
    
            supertest(server)
                .put(`${baseUrl}/users/1`)
                .set('Accept', 'application/json')
                .send(userEdited)
                .end(function(err, res) {
                    if (err) return done(err);
                    const { status, body } = res;
                    expect(status).toEqual(401);
                    return done();
            });
        });
    });
    
    describe('Delete user', () => {
        it('should delete an authentified user', async (done) => {
            const userCrashTest = {
                username: 'PleaseDontKillMe',
                firstname: 'Crash',
                lastname: 'User',
                email: 'test@mail.com',
                password: 'badPassord'
            };
            const user = await User.create(userCrashTest);
            const token = await authService({ email :userCrashTest.email, password: userCrashTest.password });

            supertest(server)
                .delete(`${baseUrl}/users/${user.id}`)
                .set('Accept', 'application/json')
                .set('Authorization', token)
                .end(async function(err, res) {
                    if (err) return done(err);
                    expect(res.status).toEqual(200);
                    const deletedUser = await User.findByPk(user.id);
                    expect(deletedUser).toBe(null);
                    return done();
            });
        });
    
        it('should allow an admin to delete a user', async (done) => {
            const userCrashTest = {
                username: 'PleaseDontKillMe',
                firstname: 'Crash',
                lastname: 'User',
                email: 'test@mail.com',
                password: 'badPassord'
            };
            const dangerousAdmin = {
                username: 'IDeleteUsers',
                firstname: 'Evil',
                lastname: 'Admin',
                email: 'eviladmin@mail.com',
                password: '%RsFSu7LZt;]6odH',
                role: 'admin'
            };

            await User.create(dangerousAdmin);

            const user = await User.create(userCrashTest);
            const token = await authService({ email: dangerousAdmin.email, password: dangerousAdmin.password });

            supertest(server)
                .delete(`${baseUrl}/users/${user.id}`)
                .set('Accept', 'application/json')
                .set('Authorization', token)
                .end(async function(err, res) {
                    if (err) return done(err);
                    expect(res.status).toEqual(200);
                    const deletedUser = await User.findByPk(user.id);
                    expect(deletedUser).toBe(null);
                    return done();
            });
        });
    
        it('should not allow a user to delete another user', async (done) =>{
            const userCrashTest = {
                username: 'PleaseDontKillMe',
                firstname: 'Crash',
                lastname: 'User',
                email: 'test@mail.com',
                password: 'badPassord'
            };
            const anotherUser = {
                username: 'Amazewor',
                firstname: 'Finley',
                lastname: 'Milton',
                email: 'finleymilton@mail.com',
                password: ';Gt2nDNVj6fQ{9'
            };
            const user = await User.create(userCrashTest);

            await User.create(anotherUser);

            const token = await authService({ email: anotherUser.email, password: anotherUser.password });

            supertest(server)
                .delete(`${baseUrl}/users/${user.id}`)
                .set('Accept', 'application/json')
                .set('Authorization', token)
                .end(async function(err, res) {
                    if (err) return done(err);
                    const survivor = await User.findByPk(user.id);

                    expect(res.status).toEqual(401);
                    expect(survivor.email).toBe(userCrashTest.email);
                    return done();
            });
        });
    
        it('should protect a user from being deleted if nobody is connected', async (done) =>{
            const userCrashTest = {
                email: 'test@mail.com',
                password: 'badPassord'
            };
            const user = await UserRepository.findByEmail(userCrashTest.email);

            supertest(server)
                .delete(`${baseUrl}/users/${user.id}`)
                .set('Accept', 'application/json')
                .end(async function(err, res) {
                    if (err) return done(err);
                    const survivor = await User.findByPk(user.id);
                    
                    expect(res.status).toEqual(401);
                    expect(survivor.email).toBe(userCrashTest.email);
                    return done();
            });
        });
    });

    describe('getFormResetPassword', () => {
        it('should authorize a user identified through a token to access to a form', async (done) => {
            const user = {
                email: 'krystalchang@mail.com',
                password: '>A0+rFiIoNmb~ZQc',
                firstname: 'Krystal',
                lastname: 'Chang',
                username: 'SushySis'
            };
            await User.create(user);
            const token = await (await authService(user)).split(' ')[1];
            supertest(server)
                .get(`${baseUrl}/users/reset-password/${token}`)
                .set('Accept', 'application/json')
                .end(async function(err, res) {
                    if (err) return done(err);
                    const { status, body } = res;

                    expect(status).toEqual(200);
                    expect(body.user.email).toBe(user.email);
                    expect(body.token).toBe(token);
                    return done();
            });
        });
    });

    describe('getById', () => {
        it('should return a user', async (done) => {
            const user = await UserRepository.findByEmail('krystalchang@mail.com');
            supertest(server)
                .get(`${baseUrl}/users/${user.id}`)
                .set('Accept', 'application/json')
                .end(async function(err, res) {
                    if (err) return done(err);
                    const { status, body } = res;

                    expect(status).toEqual(200);
                    expect(body.user.email).toBe(user.email);
                    expect(body.user.username).toBe(user.username);
                    expect(body.user.firstname).toBe(user.firstname);
                    expect(body.user.lastname).toBe(user.lastname);
                    expect(body.user.role).toBe(user.role);
                    return done();
            });
        });
    });
});
