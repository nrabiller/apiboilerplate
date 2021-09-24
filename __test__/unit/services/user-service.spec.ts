import { expect, it, describe } from '@jest/globals';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import config from '../../../src/config/config.json';
import User, { MAXFIRSTNAMELENGTH, MAXLASTNAMELENGTH, MAXPASSWORDLENGTH, MAXUSERNAMELENGTH, MINFIRSTNAMELENGTH, MINLASTNAMELENGTH, MINPASSWORDLENGTH, MINUSERNAMELENGTH } from '../../../src/entities/user';
import { UserRepository } from '../../../src/repositories/UserRepository';
import { userRegister, authService, verifyEmail, generateJwtToken, editUser, authorize, identifyUser, findAll, _delete, sendResetPassword, findById, validateUser, validateField, validatePassword } from '../../../src/services/UserService';

describe('User Service', () => {
    describe('UserRegister', () => {
        it('should create a user', async () => {
            const data = {
                username: 'Lunetes',
                firstname: 'Claudine',
                lastname: 'Hartman',
                email: 'claudinehartman@mail.com',
                password: '2T[x_]IDn>\k}^)$'
            };
            const date = new Date().toISOString();
            const user = await userRegister(data);
    
            expect(user.email).toEqual(data.email);
            expect(user.firstname).toEqual(data.firstname);
            expect(user.username).toEqual(data.username);
            expect(bcrypt.compareSync(data.password, user.password)).toBe(true);
            expect(user.createdAt.toISOString().substring(0, user.createdAt.toISOString().length - 13)).toEqual(date.substring(0, date.length - 13));
            expect(user.updatedAt.toISOString().substring(0, user.updatedAt.toISOString().length - 13)).toEqual(date.substring(0, date.length - 13));
        });
    
        it('should not create a user with a wrong email', async () => {
            const data = {
                username: 'Beckield',
                firstname: 'Rodrigo',
                lastname: 'Gaines',
                email: 'wrongemail.com',
                password: 'uW.o=y1?:Z*[";FG'
            }
            
            try {
                await userRegister(data);
            } catch(e) {
                expect(e.message).toBe('email is not valid.');
            }
        });
    
        it(`should not create a user with a username shorter than ${MINUSERNAMELENGTH} characters or longer than ${MAXUSERNAMELENGTH} characters`, async () => {
            const data = {
                username: 'u',
                firstname: 'Dale',
                lastname: 'Russel',
                email: 'dalerussel@mail.com',
                password: '5t62]ZN{E#H[L!\v'
            }
            
            try {
                await userRegister(data);
            } catch(e) {
                expect(e.message).toBe(`username should have a length between ${MINUSERNAMELENGTH} and ${MAXUSERNAMELENGTH} characters.`);
            }
    
            const data2 = {
                username: '',
                firstname: 'Gabriela',
                lastname: 'Bradshaw',
                email: 'gabrielabradshaw@email.com',
                password: 'LgAf61+-{Kl:,B)W'
            }

            data2.username = new Array(MAXUSERNAMELENGTH + 2).join('a');
            
            try {
                await userRegister(data2);
            } catch(e) {
                expect(e.message).toBe(`username should have a length between ${MINUSERNAMELENGTH} and ${MAXUSERNAMELENGTH} characters.`);
            }
        });
    
        it(`should not create a user with a firstname shorter than ${MINFIRSTNAMELENGTH} characters or longer than ${MAXFIRSTNAMELENGTH} characters`, async () => {
            const data = {
                username: 'Katriorgi',
                firstname: 'b',
                lastname: 'mildred',
                email: 'mildredbarret@mail.com',
                password: 'khF.-!sI]K>LP#4='
            }
            
            try {
                await userRegister(data);
            } catch(e) {
                expect(e.message).toBe(`firstname should have a length between ${MINFIRSTNAMELENGTH} and ${MAXFIRSTNAMELENGTH} characters.`);
            }
            const data2 = {
                username: 'A1Mountain',
                firstname: '',
                lastname: 'Coleman',
                email: 'colemansantana@email.com',
                password: '4re9@?NGsqc#Cx6z'
            }

            data2.firstname = new Array(MAXFIRSTNAMELENGTH + 2).join('a');
            
            try {
                await userRegister(data2);
            } catch(e) {
                expect(e.message).toBe(`firstname should have a length between ${MINFIRSTNAMELENGTH} and ${MAXFIRSTNAMELENGTH} characters.`);
            }
        });

        it(`should not create a user with a lastname shorter than ${MINLASTNAMELENGTH} characters or longer than ${MAXLASTNAMELENGTH} characters`, async () => {
            const data = {
                username: 'FunnyWitha',
                firstname: 'Nash',
                lastname: 'J',
                email: 'jonashnash@mail.com',
                password: '39;v4=a+"Z_W<~.2'
            }
            
            try {
                await userRegister(data);
            } catch(e) {
                expect(e.message).toBe(`lastname should have a length between ${MINLASTNAMELENGTH} and ${MAXLASTNAMELENGTH} characters.`);
            }
    
            const data2 = {
                username: 'Fibrouppl',
                firstname: 'Ortiz',
                lastname: '',
                email: 'ortiz@email.com',
                password: '4re96LjJx_b!=rw^2q9zz'
            }

            data2.lastname = new Array(MAXLASTNAMELENGTH + 2).join('a');
            
            try {
                await userRegister(data2);
            } catch(e) {
                expect(e.message).toBe(`lastname should have a length between ${MINLASTNAMELENGTH} and ${MAXLASTNAMELENGTH} characters.`);
            }
        });
    
        it(`should not create a user with a password shorter than ${MINPASSWORDLENGTH} characters or longer than ${MAXPASSWORDLENGTH} characters`, async () => {
            const data = {
                username: 'GriffonDirty',
                firstname: 'Nick',
                lastname: 'Meyer',
                email: 'nickmeyer@mail.com',
                password: 'p'
            }
    
            try {
                await userRegister(data);
            } catch(e) {
                expect(e.message).toBe(`password should have a length between ${MINPASSWORDLENGTH} and ${MAXPASSWORDLENGTH} characters.`);
            }

            const data2 = {
                username: 'RatChapter',
                firstname: 'Buck',
                lastname: 'Otis',
                email: 'otisbuck@email.com',
                password: ''
            }

            data2.password = new Array(MAXPASSWORDLENGTH + 2).join('a');
            
            try {
                await userRegister(data2);
            } catch(e) {
                expect(e.message).toBe(`password should have a length between ${MINPASSWORDLENGTH} and ${MAXPASSWORDLENGTH} characters.`);
            }
        });
    
        it('should not create a user with an email already taken', async () => {
            const data = {
                username: 'Softov',
                firstname: 'Wilson',
                lastname: 'Gibson',
                email: 'claudinehartman@mail.com',
                password: 'kl~oEI>-W6[^nvL]'
            }
            
            try {
                await userRegister(data);
            } catch(e) {
                expect(e.message).toBe('email already used');
            }
        });
    
        it('should not create a user with a username already taken', async () => {
            const data = {
                username: 'Lunetes',
                firstname: 'Malinda',
                lastname: 'Bracnh',
                email: 'malindabranch@email.com',
                password: 'Z,b6?_UDa&154MES'
            }
            
            try {
                await userRegister(data);
            } catch(e) {
                expect(e.message).toBe('username already used');
            }
        });

        it('should not allow to create a user with no email', async () => {
            const data = {
                username: 'CookieBase',
                firstname: 'Malinda',
                lastname: 'Bracnh',
                password: 'Z,b6?_UDa&154MES'
            }

            try {
                await userRegister(data); 
            } catch(e) {
                expect(e.message).toBe('email is required');
            }
        });

        it('should not allow to create a user with no username', async () => {
            const data = {
                email: 'eugeniostark@email.com',
                firstname: 'Eugenio',
                lastname: 'Stark',
                password: 'd0h,NsJF[3#uicW~'
            }

            try {
                await userRegister(data); 
            } catch(e) {
                expect(e.message).toBe('username is required');
            }
        });

        it('should not allow to create a user with no firstname', async () => {
            const data = {
                username: 'Coveregs',
                email: 'santana@email.com',
                lastname: 'Santana',
                password: 'O^Swy6"j#JW`|atN'
            }

            try {
                await userRegister(data); 
            } catch(e) {
                expect(e.message).toBe('firstname is required');
            }
        });

        it('should not allow to create a user with no lastname', async () => {
            const data = {
                username: 'Ailmendra',
                email: 'mathilda@email.com',
                firstname: 'Mathilda',
                password: ':ujF[A/}J48R%wB0'
            }

            try {
                await userRegister(data); 
            } catch(e) {
                expect(e.message).toBe('lastname is required');
            }
        });
    });

    describe('Generate JWT', () => {
        it('should generate a jwt token', async () => {
            const user = {
                username: 'Osteoid',
                firstname: 'Hector',
                lastname: 'Kyle',
                email: 'hectorkyle@mail.com',
                password: 'yP\>|BgaQ9%qsdWz'
            }

            let token = await generateJwtToken(user);
            let payload = jwt.verify(token.split(' ')[1], config.jwt_secret);

            expect(payload['email']).toBe(user.email);
        });
    });

    describe('Authenticate User', () => {
        it('should authenticate an existing user', async () => {
            const user = { email: 'claudinehartman@mail.com', password: '2T[x_]IDn>\k}^)$' };
            return authService(user).then(token => {
                let payload = jwt.verify(token.split(' ')[1], config.jwt_secret);

                expect(payload['email']).toBe(user.email);
            });         
        });
    });

    describe('verifyEmail', () => {
        it('should add a date of verification', async () => {
            const user = { email: 'claudinehartman@mail.com', password: '2T[x_]IDn>\k}^)$' };
            await verifyEmail(user.email);
            const userVerified = await UserRepository.findByEmail(user.email);

            expect(userVerified['verified']).toBeInstanceOf(Date);
        });
    });

    describe('editUser', () => {
        it('should not allow a user with role visitor to edit another user', async () => {
            const user = { email: 'claudinehartman@mail.com', password: '2T[x_]IDn>\k}^)$' };
            const data = {
                username: 'Axwerbit',
                firstname: 'Daniel',
                lastname: 'Rollins',
                email: 'danielrollins@mail.com',
                password: 'N-}W#@MT!;me>5W'
            };
            const anotherUser = await userRegister(data);
            await authService({ email: user.email, password: user.password }).then(async (token) => {
                const userFromToken = await identifyUser(token);
                try {
                    await editUser(anotherUser.id, { email: 'ihackyouraccount@mail.com' }, userFromToken);
                } catch(e) {
                    expect(e.message).toBe('unauthorized');
                    expect(e.status).toBe(401);
                }
            });
        });

        it('should not allow a user to edit all his data', async () => {
            const user = { email: 'claudinehartman@mail.com', password: '2T[x_]IDn>\k}^)$' };
            const data = {
                username: 'Lunetes',
                firstname: 'Claudine',
                lastname: 'Hartman',
                email: 'claudinehartman@mail.com',
                password: '2T[x_]IDn>\k}^)$',
                role: 'admin'
            };
            await authService({ email: user.email, password: user.password }).then(async (token) => {
                const userFromToken = await identifyUser(token);
                await editUser(userFromToken.id, data, userFromToken);
                const editedUser = await User.findByPk(userFromToken.id);

                expect(editedUser['role']).toBe('visitor');
            });
        });

        it('should edit a user who is authentified', async () => {
            const user = { email: 'claudinehartman@mail.com', password: '2T[x_]IDn>\k}^)$' };
            const params = {
                email: 'thisismynewemail@mail.com',
                password: '#newPassword1',
                firstname: 'claudinette',
                lastname: 'hartmane',
                username: 'superClaudinette'
            };
            await authService({ email: user.email, password: user.password }).then(async (token) => {
                const userFromToken = await identifyUser(token);
                await editUser(userFromToken.id, params, userFromToken);
                const editedUser = await User.findByPk(userFromToken.id);

                expect(editedUser['email']).toBe(params.email);
                expect(bcrypt.compareSync(params.password, editedUser['password'])).toBe(true);
                expect(editedUser['firstname']).toBe(params.firstname);
                expect(editedUser['lastname']).toBe(params.lastname);
                expect(editedUser['username']).toBe(params.username);
            });
        });

        it('should allow an admin to edit a user', async () => {
            const user = {
                email: 'thisismynewemail@mail.com',
                password: 'newPassword',
                firstname: 'claudinette',
                lastname: 'hartmane',
                username: 'superClaudinette'
            };
            const data = {
                email: 'admin@admin.com',
                password: '1WjME5i[L6}e?w-0',
                firstname: 'admin',
                lastname: 'admin',
                username: 'admin',
                role: 'admin'
            };
            const restoredData = {
                email: 'claudinehartman@mail.com',
                password: 'N-}W#@MT!;me>5W',
                firstname: 'Claudine',
                lastname: 'Hartman',
                username: 'Lunetes'
            };
            await User.create(data);
            await authService({ email: data.email, password: data.password }).then(async (token) => {
                const claudine = await UserRepository.findByEmail('thisismynewemail@mail.com');
                const admin = await identifyUser(token);
                await editUser(claudine.id, restoredData, admin);
                const restoredClaudine = await User.findByPk(claudine.id);

                expect(restoredClaudine['email']).toBe(restoredData.email);
                expect(bcrypt.compareSync(restoredData.password, restoredClaudine.password)).toBe(true);
                expect(restoredClaudine['firstname']).toBe(restoredData.firstname);
                expect(restoredClaudine['lastname']).toBe(restoredData.lastname);
                expect(restoredClaudine['username']).toBe(restoredData.username);
            });
        });
    });

    describe('delete User', () => {
        it('should allow an authentified user to edit his profile', async () => {
            const data = {
                email: 'leemacconnell@mail.com',
                firstname: 'Lee',
                lastname: 'Macconnell',
                password: 'XJGW)jUAmuzQ5s`l',
                username: 'TrimbleCurious'
            };
            const user = await User.create(data);
            const token = await authService({ email: data.email, password: data.password });
            await _delete(user.id, token);
            const userDeleted = await User.findByPk(user.id);

            expect(userDeleted).toBe(null);
        });

        it('should allow an admin to delete a user', async () => {
            const data = {
                email: 'leemacconnell@mail.com',
                firstname: 'Lee',
                lastname: 'Macconnell',
                password: 'XJGW)jUAmuzQ5s`l',
                username: 'TrimbleCurious'
            };
            const data2 = {
                email: 'superadmin@mail.com',
                firstname: 'Basil',
                lastname: 'Lutz',
                password: '!`5C9{xa}d%Rq',
                username: 'Topicum',
                role: 'admin'
            };
            const user = await User.create(data);
            await User.create(data2);
            const token = await authService({ email: data2.email, password: data2.password });
            await _delete(user.id, token);
            const userDeleted = await User.findByPk(user.id);

            expect(userDeleted).toBe(null);
        });

        it('should not allow a user to delete another user', async () => {
            const data = {
                email: 'leemacconnell@mail.com',
                firstname: 'Lee',
                lastname: 'Macconnell',
                password: 'XJGW)jUAmuzQ5s`l',
                username: 'TrimbleCurious'
            };
            await User.create(data);
            const admin = await UserRepository.findByEmail('superadmin@mail.com');
            const token = await authService({ email: data.email, password: data.password });
            try {
                await _delete(admin.id, token);
            } catch (e) {
                expect(e.status).toBe(401);
                expect(e.message).toBe('unauthorized');
            }
        });
    });

    describe('findAll', () => {
        it('should return all registered users', async () => {
            const users = await findAll();
            expect(users instanceof Array).toBe(true);
            users.forEach(user => {
                expect(user).toHaveProperty('id');
                expect(user).toHaveProperty('email');
                expect(user).toHaveProperty('firstname');
                expect(user).toHaveProperty('lastname');
                expect(user).toHaveProperty('username');
                expect(user).toHaveProperty('verified');
                expect(user).toHaveProperty('role');
                expect(user).toHaveProperty('createdAt');
                expect(user).toHaveProperty('updatedAt');
            });
        });
    });

    describe('findById', () => {
        it('should return a user', async () => {
            const user = await UserRepository.findByEmail('claudinehartman@mail.com');
            const userReturned = await findById(user.id);

            expect(user.email).toBe(userReturned.email);
            expect(user.firstname).toBe(userReturned.firstname);
            expect(user.lastname).toBe(userReturned.lastname);
            expect(user.username).toBe(userReturned.username);
            expect(user.role).toBe(userReturned.role);
        });
    });

    describe('identifyUser', () => {
        it('should return the authentified user', async () => {
            const user = { email: 'claudinehartman@mail.com', password: 'N-}W#@MT!;me>5W' };
            await authService({ email: user.email, password: user.password }).then(async (token) => {
                const userFromToken = await identifyUser(token);
                expect(userFromToken.email).toBe(user.email);
            });
        });
    });

    describe('sendResetPassword', () => {
        it('should send an email with a link to reset your password', async ()=> {
            const user = {
                email: config.smtpOptions.auth.user,
                firstname: 'ethereal',
                lastname: 'smtp',
                password: config.smtpOptions.auth.pass,
                username: 'smtpuser'
            };
            await User.create(user);
            await sendResetPassword(user.email, true).then(mail => {
                const email = nodemailer.getTestMessageUrl(mail);

                expect(email.toString().substring(0, 31)).toBe('https://ethereal.email/message/');
            });
        });
    });

    describe('authorize', () => {
        it('should return an authenticated user with a role visitor', async () => {
            const user = { email: 'claudinehartman@mail.com', password: 'N-}W#@MT!;me>5W' };
            const token = await authService(user);
            const req = { headers: { authorization : token }};
            const userReturned = await authorize('visitor', req);

            expect(user.email).toBe(userReturned.email);
        });

        it('should not allow an authenticated user with a role visitor to access to admin content', async () => {
            const user = { email: 'claudinehartman@mail.com', password: 'N-}W#@MT!;me>5W' };
            const token = await authService(user);
            const req = { headers: { authorization : token }};
            try {
                await authorize('admin', req);
            } catch(e) {
                expect(e.status).toBe(401);
                expect(e.message).toBe('unauthorized');
            }
        });
    });

    describe('validateUser', () => {
        it(`should not validate a user with a firstname shorter than ${MINFIRSTNAMELENGTH} characters`, async () => {
            const user = { email: 'test@test.com', firstname: 'a', username: 'test' };
            try {
                await validateUser(user);
            } catch(e) {
                expect(e.message).toBe(`firstname should have a length between ${MINFIRSTNAMELENGTH} and ${MAXFIRSTNAMELENGTH} characters.`);
                expect(e.status).toBe(400);
            }
        });

        it(`should not validate a user with a firstname longer than ${MAXFIRSTNAMELENGTH} characters`, async () => {
            const user = { email: 'test@test.com', firstname: '', username: 'test' };

            try {
                await validateUser(user);
            } catch(e) {
                expect(e.message).toBe(`firstname should have a length between ${MINFIRSTNAMELENGTH} and ${MAXFIRSTNAMELENGTH} characters.`);
                expect(e.status).toBe(400);
            }
        });
    });

    describe('validateField', () => {
        it('returns an error when field contain a special character', () => {
            const field = 'test@';
            try {
                validateField(field, 'username')
            } catch(e) {
                expect(e.message).toBe('only alphanumeric characters are allowed for username');
                expect(e.status).toBe(400);
            }
        });
    });

    describe('validatePassword', () => {
        it('returns an error when the password miss a lowercase character', () => {
            const badPassord = '@PASSWORD1';
            try {
                validatePassword(badPassord);
            } catch(e) {
                expect(e.message).toBe('password should contain at least one lowercase character');
                expect(e.status).toBe(400);
            }
        });

        it('returns an error when the password miss a uppercase character', () => {
            const badPassord = '@password1';
            try {
                validatePassword(badPassord);
            } catch(e) {
                expect(e.message).toBe('password should contain at least one uppercase character');
                expect(e.status).toBe(400);
            }
        });

        it('returns an error when the password miss a special character', () => {
            const badPassord = 'Password1';
            try {
                validatePassword(badPassord);
            } catch(e) {
                expect(e.message).toBe('password should contain at least one special character');
                expect(e.status).toBe(400);
            }
        });

        it('returns an error when the password miss a special character', () => {
            const badPassord = 'Password@';
            try {
                validatePassword(badPassord);
            } catch(e) {
                expect(e.message).toBe('password should contain at least one numerical character');
                expect(e.status).toBe(400);
            }
        });
    });
});
