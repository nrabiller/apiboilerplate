import { expect, it, describe } from '@jest/globals';
import BlogPost from '../../../src/entities/blog-post';
import User from '../../../src/entities/user';
import { UserRepository } from '../../../src/repositories/UserRepository';

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

describe('BlogPost entity', () => {
    describe('create a blogPost', () => {
        it('should have a valid title', async () => {
            const userData = {
                email: 'olivegomez@mail.com',
                username: 'Cyproman',
                password: '6U%wFnv!s@N*0p{J',
                firstname: 'Olive',
                lastname: 'Gomez'
            };
            const user = await User.create(userData);
            const data = {
                title: '',
                content: 'Valid content',
                published: false,
                author_id: user.id
            };
            data.title = new Array(201 + 1).join('#');
            
            await BlogPost.create(data).catch(blogPost => { return checkSequelizeErrors(blogPost) });
        });

        it('should have a valid content', async () => {
            const userData = {
                email: 'olivegomez@mail.com',
            };
            const user = await UserRepository.findByEmail(userData.email);
            const data = {
                title: '',
                content: 'Valid content',
                published: false,
                author_id: user.id
            };
            data.title = new Array(6001 + 1).join('#');
            
            await BlogPost.create(data).catch(blogPost => { return checkSequelizeErrors(blogPost) });
        });
    });
});
