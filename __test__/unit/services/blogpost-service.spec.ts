import { expect, it, describe } from '@jest/globals';
import User from '../../../src/entities/user';
import { create, edit, _delete, findAll, findById, findBlogPostsByUserId, validateBlogPost } from '../../../src/services/BlogPostService';
import { UserRepository } from '../../../src/repositories/UserRepository';
import BlogPost from '../../../src/entities/blog-post';
import { authService } from '../../../src/services/UserService';
import { MAXTITLELENGTH, MAXCONTENTLENGTH } from '../../../src/entities/blog-post';

describe('BlogPostService', () => {
    describe('create', () => {
        it('should create a blogPost when an authentified user send good data', async () => {
            const user = {
                email: 'lillianescobar@mail.com',
                username: 'gooduser',
                password: 'verystrongpassword',
                firstname: 'Lillian',
                lastname: 'Escobar'
            };
            const data = {
                title: 'safe title',
                content: 'A very long story',
                published: false
            };
            const u = await User.create(user);
            const blogPost = await create(data, u);
            expect(blogPost.title).toBe(data.title);
            expect(blogPost.content).toBe(data.content);
            expect(blogPost.published).toBe(false);
            expect(blogPost.author_id).toBe(u.id);
        });

        it('should not allow the creation of blogpost without authentication', async () => {
            const data = {
                title: 'I cannot create this',
                content: 'my credit card number is 374408300498840',
                published: true 
            };
            try {
                await create(data, 'badtoken');
            } catch(e) {
                expect(e.message).toBe('cannot find user');
                expect(e.status).toBe(500);
            }
        });

        it('should not allow the creation of a published blogPost with no title', async () => {
            const user = await UserRepository.findByEmail('lillianescobar@mail.com');
            const data = {
                title: '',
                content: 'Bad content',
                published: true
            };
            try {
                await create(data, user)
            } catch(e) {
                expect(e.message).toBe('you cannot publish a blogPost with no title');
                expect(e.status).toBe(400);
            }
        });
        
        it('should not allow the creation of a published blogPost with no content', async () => {
            const user = await UserRepository.findByEmail('lillianescobar@mail.com');
            const data = {
                title: 'Bad content',
                content: '',
                published: true
            };
            try {
                await create(data, user)
            } catch(e) {
                expect(e.message).toBe('you cannot publish a blogPost with no content');
                expect(e.status).toBe(400);
            }
        });

        it('should not allow the creation of a blogPost with a title too long', async () => {
            const user = await UserRepository.findByEmail('lillianescobar@mail.com');
            const data = {
                title: '',
                content: 'Bad content',
                published: true
            };
            data.title = new Array(201 + 1).join('#');
            try {
                await create(data, user)
            } catch(e) {
                expect(e.message).toBe(`title can contain ${MAXTITLELENGTH} characters maximum`);
                expect(e.status).toBe(400);
            }
        });

        it('should not allow the creation of a blogPost with a content too long', async () => {
            const user = await UserRepository.findByEmail('lillianescobar@mail.com');
            const data = {
                title: 'Bad content',
                content: '',
                published: true
            };
            data.content = new Array(6001 + 1).join('#');
            try {
                await create(data, user)
            } catch(e) {
                expect(e.message).toBe(`content can contain ${MAXCONTENTLENGTH} characters maximum`);
                expect(e.status).toBe(400);
            }
        });
    });

    describe('editBlogPost', () => {
        it('should not allow to publish a blogPost with no title', async () => {
            const user = await UserRepository.findByEmail('lillianescobar@mail.com');
            const data = {
                title: '',
                content: 'Bad Content',
                published: true
            };
            const blogPosts = await user.getBlogPosts();
            try {
                await edit(blogPosts[0].id, data, user);
            } catch(e) {
                expect(e.message).toBe('you cannot publish a blogPost with no title');
                expect(e.status).toBe(400);
            }
        });

        it('should not allow to publish a blogPost with no content', async () => {
            const user = await UserRepository.findByEmail('lillianescobar@mail.com');
            const data = {
                title: 'Bad Content',
                content: '',
                published: true
            };
            const blogPosts = await user.getBlogPosts();
            try {
                await edit(blogPosts[0].id, data, user);
            } catch(e) {
                expect(e.message).toBe('you cannot publish a blogPost with no content');
                expect(e.status).toBe(400);
            }
        });

        it('should not allow to edit of a blogPost with a title too long', async () => {
            const user = await UserRepository.findByEmail('lillianescobar@mail.com');
            const data = {
                title: '',
                content: 'Bad Content',
                published: true
            };
            data.title = new Array(201 + 1).join('#');
            const blogPosts = await user.getBlogPosts();
            try {
                await edit(blogPosts[0].id, data, user);
            } catch(e) {
                expect(e.message).toBe(`title can contain ${MAXTITLELENGTH} characters maximum`);
                expect(e.status).toBe(400);
            }
        });

        it('should not allow to edit of a blogPost with a content too long', async () => {
            const user = await UserRepository.findByEmail('lillianescobar@mail.com');
            const data = {
                title: 'Bad Content',
                content: '',
                published: true
            };
            data.content = new Array(6001 + 1).join('#');
            const blogPosts = await user.getBlogPosts();
            try {
                await edit(blogPosts[0].id, data, user);
            } catch(e) {
                expect(e.message).toBe(`content can contain ${MAXCONTENTLENGTH} characters maximum`);
                expect(e.status).toBe(400);
            }
        });

        it('should allow a user to edit his blogpost', async () => {
            const user = await UserRepository.findByEmail('lillianescobar@mail.com');
            const blogPost = await user.getBlogPosts();
            const data = {
                title: 'new title',
                content: 'new story',
                published: true
            };
            await edit(blogPost[0].id, data, user);
            const editedBlogPost = await user.getBlogPosts();
            expect(editedBlogPost[0].title).toBe(data.title);
            expect(editedBlogPost[0].content).toBe(data.content);
            expect(editedBlogPost[0].published).toBe(data.published);
        });

        it('should allow an admin to edit the blogpost of another user', async () => {
            const adminData = {
                email: 'superadmin@mail.com',
                username: 'superadmin',
                firstname: 'super',
                lastname: 'admin',
                password: '^]=:<HkuC0TGULj',
                role: 'admin'
            };
            const admin = await User.create(adminData);
            const user = await UserRepository.findByEmail('lillianescobar@mail.com');
            const blogPost = await user.getBlogPosts();
            const data = {
                title: 'I do what i want',
                content: 'admin is a powerful role',
                published: true
            };
            await edit(blogPost[0].id, data, admin);
            const editedBlogPost = await user.getBlogPosts();
            expect(editedBlogPost[0].title).toBe(data.title);
            expect(editedBlogPost[0].content).toBe(data.content);
            expect(editedBlogPost[0].published).toBe(data.published);
        });

        it('should not allow a user to edit the blogpost of another user', async () => {
            const userData = {
                email: 'danyates@mail.com',
                username: 'Agedical',
                firstname: 'Dan',
                lastname: 'Yates',
                password: 'OtJblpaZ?;{1q3.',
            };
            const anotherUser = await User.create(userData);
            const user = await UserRepository.findByEmail('lillianescobar@mail.com');
            const blogPost = await user.getBlogPosts();
            const data = {
                title: 'I try to edit your blogpost',
                content: 'You wanted to say that',
                published: true
            };
            try {
                await edit(blogPost[0].id, data, anotherUser);
            } catch(e) {
                expect(e.message).toBe('unauthorized');
                expect(e.status).toBe(401);
            }
        });
    });

    describe('deleteBlogPost', () => {
        it('should allow a user to delete his blogpost', async () => {
            const user = await UserRepository.findByEmail('lillianescobar@mail.com');
            const blogPosts = await user.getBlogPosts();
            const countBeforeDelete = await user.countBlogPosts();
            await _delete(blogPosts[0].id, user);
            const countAfterDelete = await user.countBlogPosts();
            expect(countBeforeDelete - 1).toEqual(countAfterDelete);
        });

        it('should not allow a user to delete the blogpost of another user', async () => {
            const user = await UserRepository.findByEmail('lillianescobar@mail.com');
            const data = {
                title: 'A blogpost',
                content: 'Very important content',
                published: false,
                author_id: user.id
            };
            const userData = {
                email: 'ettahanney@mail.com',
                password: 'Wurtc=}ejQvfDT#C',
                firstname: 'Etta',
                lastname: 'Haney',
                username: 'Clownia'
            };
            const anotherUser = await User.create(userData);
            const blogPost = await BlogPost.create(data);
            try {
                await _delete(blogPost.id, anotherUser);
            } catch(e) {
                expect(e.status).toBe(401);
                expect(e.message).toBe('unauthorized');
            }
        });

        it('should allow an admin to delete the blogpost of another user', async () => {
            const user = await UserRepository.findByEmail('lillianescobar@mail.com');
            const data = {
                title: 'A blogpost',
                content: 'Very important content',
                published: false,
                author_id: user.id
            };
            const adminData = {
                email: 'cyrilcosta@mail.com',
                password: '.0XD"nkWg!52*cj&',
                firstname: 'Cyril',
                lastname: 'Costa',
                username: 'Goofyrd',
                role: 'admin'
            };
            const admin = await User.create(adminData);
            const blogPost = await BlogPost.create(data);
            const countBeforeDelete = await user.countBlogPosts();
            await _delete(blogPost.id, admin);
            const countAfterDelete = await user.countBlogPosts();
            expect(countBeforeDelete - 1).toEqual(countAfterDelete);
        });
    });

    describe('findAll', () => {
        it('should return a list of published blogPosts', async () => {
            const user = await UserRepository.findByEmail('lillianescobar@mail.com');
            const data = {
                title: 'Title',
                content: 'Content',
                published: true,
                author_id: user.id
            };
            await BlogPost.create(data);
            const blogPosts = await findAll();
            for (let i = 0; i < blogPosts.length; i++) {
                expect(blogPosts[i].published).toBe(true);
            }
        });
    });

    describe('findById', () => {
        it('should return a published blogpost', async () => {
            const userData = {
                email: 'lillianescobar@mail.com',
                password: 'verystrongpassword'
            };
            const user = await UserRepository.findByEmail('lillianescobar@mail.com');
            const token = await authService(userData);
            const data = {
                title: 'Title',
                content: 'Content',
                published: true,
                author_id: user.id
            };
            const blogPostCreated = await BlogPost.create(data);
            const blogPost = await findById(blogPostCreated.id, token);
            expect(blogPost.published).toBe(true);
        });

        it('should not allow a user to see the blogPost of another user if it is not published', async () => {
            const anotherUser = {
                email: 'ettahanney@mail.com',
                password: 'Wurtc=}ejQvfDT#C'
            };
            const token = await authService(anotherUser);
            const user = await UserRepository.findByEmail('lillianescobar@mail.com');
            const blogPosts = await user.getBlogPosts();
            const unpublishedBlogPosts = blogPosts.filter(blogPost => blogPost.published == false);
            try {
                await findById(unpublishedBlogPosts[0].id, token);
            } catch(e) {
                expect(e.message).toBe('unauthorized');
                expect(e.status).toBe(401);
            }
        });

        it('should allow an admin to see the blogPost of a user if it is not publised', async () => {
            const admin = {
                email: 'cyrilcosta@mail.com',
                password: '.0XD"nkWg!52*cj&'
            };
            const token = await authService(admin);
            const user = await UserRepository.findByEmail('lillianescobar@mail.com');
            const blogPosts = await user.getBlogPosts();
            const unpublishedBlogPosts = blogPosts.filter(blogPost => blogPost.published == false);
            const blogPost = await findById(unpublishedBlogPosts[0].id, token);
            expect(blogPost.title).toBe('A blogpost');
            expect(blogPost.content).toBe('Very important content');
            expect(blogPost.published).toBe(false);
        });
    });

    describe('findBlogPostsByUserId', () => {
        it('should return the list of all published blogpost of a user', async () => {
            const user = await UserRepository.findByEmail('lillianescobar@mail.com');
            const blogPosts = await findBlogPostsByUserId(user.id);
            for (let i = 0; i < blogPosts.length; i++) {
                expect(blogPosts[i].published).toBe(true);
            }
            expect(blogPosts.length).toBeGreaterThan(0);
        });
    });

    describe('validateBlogPost', () => {
        it('should throw an error if a blogPost is published and has no title', async () => {
            const user = await UserRepository.findByEmail('lillianescobar@mail.com');
            const fakeBlogPost = {
                title: '',
                content: 'Content',
                published: true,
                author_id: user.id
            };
            try {
                validateBlogPost(fakeBlogPost);
            } catch(e) {
                expect(e.status).toBe(400);
                expect(e.message).toBe('you cannot publish a blogPost with no title');
            }
        });

        it('should throw an error if a blogPost is published and has no content', async () => {
            const user = await UserRepository.findByEmail('lillianescobar@mail.com');
            const fakeBlogPost = {
                title: 'Title',
                content: '',
                published: true,
                author_id: user.id
            };
            try {
                validateBlogPost(fakeBlogPost);
            } catch(e) {
                expect(e.status).toBe(400);
                expect(e.message).toBe('you cannot publish a blogPost with no content');
            }
        });

        it('should throw an error if a blogPost\'s title is too long', async () => {
            const user = await UserRepository.findByEmail('lillianescobar@mail.com');
            const fakeBlogPost = {
                title: '',
                content: 'Content',
                published: true,
                author_id: user.id
            };
            fakeBlogPost.title = new Array(201 + 1).join('#');
            try {
                validateBlogPost(fakeBlogPost);
            } catch(e) {
                expect(e.status).toBe(400);
                expect(e.message).toBe(`title can contain ${MAXTITLELENGTH} characters maximum`);
            }
        });

        it('should throw an error if a blogPost\'s content is too long', async () => {
            const user = await UserRepository.findByEmail('lillianescobar@mail.com');
            const fakeBlogPost = {
                title: 'Title',
                content: '',
                published: true,
                author_id: user.id
            };
            fakeBlogPost.content = new Array(6001 + 1).join('#');
            try {
                validateBlogPost(fakeBlogPost);
            } catch(e) {
                expect(e.status).toBe(400);
                expect(e.message).toBe(`content can contain ${MAXCONTENTLENGTH} characters maximum`);
            }
        });

        it('should validate a good blogPost', async () => {
            const user = await UserRepository.findByEmail('lillianescobar@mail.com');
            const fakeBlogPost = {
                title: 'Title',
                content: 'Content',
                published: true,
                author_id: user.id
            };
            validateBlogPost(fakeBlogPost);
            expect(1).toBe(1);
        });
    });
});
