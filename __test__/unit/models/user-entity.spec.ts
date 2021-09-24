import { expect, it, describe } from '@jest/globals';
import User from '../../../src/entities/user';

const checkSequelizeErrors = (obj: any) => {
    let msg = '';
    if (obj !== undefined && obj['errors']) {
        obj.errors.forEach((err, key, errors) => {
            msg += err.type + ': ' + err.message;
            if (errors.length - 1 !== key) msg += ',\n';
        })
        expect(obj.toString()).toEqual('SequelizeValidationError: ' + msg);
    }
}

describe('User entity', () => {
    describe('Create a user', () => {
        it('returns an error when the email is not valid', async () => {
            User.create({ firstname: 'Hobbs', lastname: 'Elisa', username: 'Bugsli', email: 'invalid_email', password: 'leu|^#gmC<DGEoi!' }).catch(user => {
                return checkSequelizeErrors(user);
            });
        });
    
        it('returns an error when a user is created with a firstname shorter than two characters', async () => {
            User.create({ firstname: 'a', lastname: 'bbbb', username: 'ababab', email: 'validemail@mail.com', password: '?,\|C`BU2c8{.[v4' }).catch(user => {
                return checkSequelizeErrors(user);
            });
        });
        it('returns an error when a user is created with a lastname shorter than two characters', async () => {
            User.create({ firstname: 'aaaa', lastname: 'b', username: 'ababab', email: 'validemail@mail.com', password: 'ClqbmL,\j_G5U.X4' }).catch(user => {
                return checkSequelizeErrors(user);
            });
        });
        it('returns an error when a user is created with a username shorter than two characters', async () => {
            User.create({ firstname: 'aaaa', lastname: 'bbb', username: 'a', email: 'validemail@mail.com', password: '$jv6.SNP~a)<uUl=' }).catch(user => {
                return checkSequelizeErrors(user);
            });
        });
    
        it('should have a firstname with maximum length of 40 characters', async () => {
            let firstname: string = '';
            for (let i = 0; i < 42; i++) {
                firstname += 'a';
            }
            User.create({ firstname: firstname, lastname: 'Allan' , username: 'PersonalSter', email: 'validemail@mail.com', password: 'gD`(L+zhyjNwVJMm' }).catch(user => {
                return checkSequelizeErrors(user);
            });
        });
    
        it('should not include a space character in the name, username or lastname', async () => {
            User.create({ firstname: '  ', lastname: 'normallastname', username: 'normalusername', email: 'validemail@mail.com', password: 'normalpassword' }).catch(user => {
                return checkSequelizeErrors(user);
            });
            User.create({ firstname: 'normalname', lastname: '   ', username: 'normalusername', email: 'validemail@mail.com', password: 'normalpassword' }).catch(user => {
                return checkSequelizeErrors(user);
            });
            User.create({ firstname: 'normalname', lastname: 'normallastname', username: '    ', email: 'validemail@mail.com', password: 'normalpassword' }).catch(user => {
                return checkSequelizeErrors(user);
            });
        });

        it('should create a user', async () => {
            const user1 = { firstname: 'doe', lastname: 'john', username: 'johndoe', email: 'johndoe@mail.com', password: 'verysecretpassword'}
            User.create(user1).then(user => {
                expect(user).toHaveProperty(['updatedAt']);
                expect(user).toHaveProperty(['createdAt']);
                expect(user).toHaveProperty(['id']);
                expect(user).toHaveProperty(['username']);
                expect(user).toHaveProperty(['lastname']);
                expect(user).toHaveProperty(['firstname']);
                expect(user).toHaveProperty(['email']);
                expect(user).toHaveProperty(['password']);
            });
        });
    });
});
