import { expect, it, describe } from '@jest/globals';
import supertest from 'supertest';
import { authService } from '../../../src/services/UserService';
import server from '../../../src/server';
import User from '../../../src/entities/user';
import { UserRepository } from '../../../src/repositories/UserRepository';
import BlogPost from '../../../src/entities/blog-post';
import { MAXTITLELENGTH, MAXCONTENTLENGTH } from '../../../src/entities/blog-post';

const baseUrl = '/api/v1';

describe('BlogPostController', () => {
    describe('createBlogPost', () => {
        it('should create a blogPost when an authentified user send good data', async (done) => {
            const userData = {
                username: 'Anemonasc',
                lastname: 'Conner',
                firstname: 'Genaro',
                email: 'genaroconner@mail.com',
                password: 'KP>$62E@tWC*3/R9'
            };
            const data = {
                title: 'safe title',
                content: 'A very long story',
                published: false
            };
            const user = await User.create(userData);
            const token = await authService({ email: userData.email, password: userData.password });
            supertest(server)
                .post(`${baseUrl}/blogposts/`)
                .set('Accept', 'application/json')
                .set('Authorization', token)
                .send(data)
                .end(function(err, res) {
                    if (err) return done(err);
                    const { status, body } = res;

                    expect(status).toEqual(201);
                    expect(body.blogPost.title).toBe(data.title);
                    expect(body.blogPost.content).toBe(data.content);
                    expect(body.blogPost.published).toBe(data.published);
                    expect(body.blogPost.author_id).toBe(user.id);
                    return done();
            });
        });

        it('should not allow the creation of a published blogPost with no title', async (done) => {
            const userData = {
                email: 'genaroconner@mail.com',
                password: 'KP>$62E@tWC*3/R9'
            };
            const data = {
                title: '',
                content: 'A very long story',
                published: true
            };
            const user = await UserRepository.findByEmail(userData.email)
            const token = await authService({ email: userData.email, password: userData.password });
            supertest(server)
                .post(`${baseUrl}/blogposts/`)
                .set('Accept', 'application/json')
                .set('Authorization', token)
                .send(data)
                .end(function(err, res) {
                    if (err) return done(err);
                    const { status, body } = res;

                    expect(status).toEqual(400);
                    expect(body.error).toBe('you cannot publish a blogPost with no title');
                    return done();
            });
        });

        it('should not allow the creation of a published blogPost with no content', async (done) => {
            const userData = {
                email: 'genaroconner@mail.com',
                password: 'KP>$62E@tWC*3/R9'
            };
            const data = {
                title: 'a blogpost',
                content: '',
                published: true
            };
            const user = await UserRepository.findByEmail(userData.email)
            const token = await authService({ email: userData.email, password: userData.password });
            supertest(server)
                .post(`${baseUrl}/blogposts/`)
                .set('Accept', 'application/json')
                .set('Authorization', token)
                .send(data)
                .end(function(err, res) {
                    if (err) return done(err);
                    const { status, body } = res;

                    expect(status).toEqual(400);
                    expect(body.error).toBe('you cannot publish a blogPost with no content');
                    return done();
            });
        });

        it('should not allow the creation of a published blogPost with a title too long', async (done) => {
            const userData = {
                email: 'genaroconner@mail.com',
                password: 'KP>$62E@tWC*3/R9'
            };
            const data = {
                title: '',
                content: 'bad content',
                published: true
            };
            data.title = new Array(201 + 1).join('#');
            const user = await UserRepository.findByEmail(userData.email)
            const token = await authService({ email: userData.email, password: userData.password });
            supertest(server)
                .post(`${baseUrl}/blogposts/`)
                .set('Accept', 'application/json')
                .set('Authorization', token)
                .send(data)
                .end(function(err, res) {
                    if (err) return done(err);
                    const { status, body } = res;

                    expect(status).toEqual(400);
                    expect(body.error).toBe(`title can contain ${MAXTITLELENGTH} characters maximum`);
                    return done();
            });
        });

        it('should not allow the creation of a published blogPost with a content too long', async (done) => {
            const userData = {
                email: 'genaroconner@mail.com',
                password: 'KP>$62E@tWC*3/R9'
            };
            const data = {
                title: 'Bad content',
                content: '',
                published: true
            };
            data.content = new Array(6001 + 1).join('#');
            const user = await UserRepository.findByEmail(userData.email)
            const token = await authService({ email: userData.email, password: userData.password });
            supertest(server)
                .post(`${baseUrl}/blogposts/`)
                .set('Accept', 'application/json')
                .set('Authorization', token)
                .send(data)
                .end(function(err, res) {
                    if (err) return done(err);
                    const { status, body } = res;

                    expect(status).toEqual(400);
                    expect(body.error).toBe(`content can contain ${MAXCONTENTLENGTH} characters maximum`);
                    return done();
            });
        });

        it('should not allow the creation of a blogPost without being authenticated', async (done) => {
            const data = {
                title: 'Good title',
                content: 'Good content',
                published: true
            };
            supertest(server)
                .post(`${baseUrl}/blogposts/`)
                .set('Accept', 'application/json')
                .send(data)
                .end(function(err, res) {
                    if (err) return done(err);
                    const { status, body } = res;
                    expect(status).toEqual(401);
                    expect(body.error).toBe('no connected user');
                    return done();
            });
        });
    });
    
    describe('editBlogPost', () => {
        it('should allow a user to edit his blogpost', async (done) => {
            const userData = {
                email: 'genaroconner@mail.com',
                password: 'KP>$62E@tWC*3/R9'
            };
            const data = {
                title: 'Good new title',
                content: 'Good new content',
                published: true
            };
            const user = await UserRepository.findByEmail(userData.email);
            const blogPosts = await user.getBlogPosts();
            const token = await authService({ email: userData.email, password: userData.password });
            supertest(server)
                .put(`${baseUrl}/blogposts/${blogPosts[0].id}`)
                .set('Accept', 'application/json')
                .set('Authorization', token)
                .send(data)
                .end(function(err, res) {
                    if (err) return done(err);
                    const { status, body } = res;

                    expect(status).toEqual(201);
                    expect(body.blogPost.title).toBe(data.title);
                    expect(body.blogPost.content).toBe(data.content);
                    expect(body.blogPost.published).toBe(data.published);
                    return done();
            });
        });

        it('should not allow to edit a blogpost without being authenticated', async (done) => {
            const userData = {
                email: 'genaroconner@mail.com',
                password: 'KP>$62E@tWC*3/R9'
            };
            const data = {
                title: 'Good new title',
                content: 'Good new content',
                published: true
            };
            const user = await UserRepository.findByEmail(userData.email);
            const blogPosts = await user.getBlogPosts();
            supertest(server)
                .put(`${baseUrl}/blogposts/${blogPosts[0].id}`)
                .set('Accept', 'application/json')
                .send(data)
                .end(function(err, res) {
                    if (err) return done(err);
                    const { status, body } = res;

                    expect(status).toEqual(401);
                    expect(body.error).toBe('no connected user');
                    return done();
            });
        });

        it('should not allow to publish a blogpost with no title', async (done) => {
            const userData = {
                email: 'genaroconner@mail.com',
                password: 'KP>$62E@tWC*3/R9'
            };
            const data = {
                title: '',
                content: 'Good content',
                published: true
            };
            const user = await UserRepository.findByEmail(userData.email);
            const blogPosts = await user.getBlogPosts();
            const token = await authService({ email: userData.email, password: userData.password });
            supertest(server)
                .put(`${baseUrl}/blogposts/${blogPosts[0].id}`)
                .set('Accept', 'application/json')
                .set('Authorization', token)
                .send(data)
                .end(function(err, res) {
                    if (err) return done(err);
                    const { status, body } = res;

                    expect(status).toEqual(400);
                    expect(body.error).toBe('you cannot publish a blogPost with no title');
                    return done();
            });
        });

        it('should not allow to publish a blogpost with no content', async (done) => {
            const userData = {
                email: 'genaroconner@mail.com',
                password: 'KP>$62E@tWC*3/R9'
            };
            const data = {
                title: 'Good title',
                content: '',
                published: true
            };
            const user = await UserRepository.findByEmail(userData.email);
            const blogPosts = await user.getBlogPosts();
            const token = await authService({ email: userData.email, password: userData.password });
            supertest(server)
                .put(`${baseUrl}/blogposts/${blogPosts[0].id}`)
                .set('Accept', 'application/json')
                .set('Authorization', token)
                .send(data)
                .end(function(err, res) {
                    if (err) return done(err);
                    const { status, body } = res;

                    expect(status).toEqual(400);
                    expect(body.error).toBe('you cannot publish a blogPost with no content');
                    return done();
            });
        });

        it('should not allow to publish a blogpost with a title too long', async (done) => {
            const userData = {
                email: 'genaroconner@mail.com',
                password: 'KP>$62E@tWC*3/R9'
            };
            const data = {
                title: '',
                content: 'Good content',
                published: true
            };
            data.title = new Array(201 + 1).join('#');
            const user = await UserRepository.findByEmail(userData.email);
            const blogPosts = await user.getBlogPosts();
            const token = await authService({ email: userData.email, password: userData.password });
            supertest(server)
                .put(`${baseUrl}/blogposts/${blogPosts[0].id}`)
                .set('Accept', 'application/json')
                .set('Authorization', token)
                .send(data)
                .end(function(err, res) {
                    if (err) return done(err);
                    const { status, body } = res;

                    expect(status).toEqual(400);
                    expect(body.error).toBe(`title can contain ${MAXTITLELENGTH} characters maximum`);
                    return done();
            });
        });

        it('should not allow to publish a blogpost with a content too long', async (done) => {
            const userData = {
                email: 'genaroconner@mail.com',
                password: 'KP>$62E@tWC*3/R9'
            };
            const data = {
                title: 'Good title',
                content: '',
                published: true
            };
            data.content = new Array(6001 + 1).join('#');
            const user = await UserRepository.findByEmail(userData.email);
            const blogPosts = await user.getBlogPosts();
            const token = await authService({ email: userData.email, password: userData.password });
            supertest(server)
                .put(`${baseUrl}/blogposts/${blogPosts[0].id}`)
                .set('Accept', 'application/json')
                .set('Authorization', token)
                .send(data)
                .end(function(err, res) {
                    if (err) return done(err);
                    const { status, body } = res;

                    expect(status).toEqual(400);
                    expect(body.error).toBe(`content can contain ${MAXCONTENTLENGTH} characters maximum`);
                    return done();
            });
        });

        it('should not allow to edit a blogpost of another user', async (done) => {
            const userData = {
                email: 'genaroconner@mail.com',
                password: 'KP>$62E@tWC*3/R9'
            };
            const anotherUserData = {
                email: 'rosiemaccarthy@mail.com',
                password: '`MB\Ft$@ho:!D.}4',
                username: 'SublimeShiya',
                firstname: 'Rosie',
                lastname: 'Maccarthy'
            };
            const data = {
                title: 'Good title',
                content: '',
                published: true
            };
            data.content = new Array(6001 + 1).join('#');
            const user = await UserRepository.findByEmail(userData.email);
            await User.create(anotherUserData);
            const blogPosts = await user.getBlogPosts();
            const token = await authService({ email: anotherUserData.email, password: anotherUserData.password });
            supertest(server)
                .put(`${baseUrl}/blogposts/${blogPosts[0].id}`)
                .set('Accept', 'application/json')
                .set('Authorization', token)
                .send(data)
                .end(function(err, res) {
                    if (err) return done(err);
                    const { status, body } = res;

                    expect(status).toEqual(401);
                    expect(body.error).toBe('unauthorized');
                    return done();
            });
        });

        it('should allow an admin to edit a blogpost of another user', async (done) => {
            const userData = {
                email: 'genaroconner@mail.com',
                password: 'KP>$62E@tWC*3/R9'
            };
            const adminData = {
                email: 'annierichard@mail.com',
                password: '~&%xF"RT[wWJ>?q6',
                username: 'Switiacy',
                firstname: 'Annie',
                lastname: 'Richard',
                role: 'admin'
            };
            const data = {
                title: 'New title',
                content: 'New content',
                published: true
            };
            const user = await UserRepository.findByEmail(userData.email);
            await User.create(adminData);
            const blogPosts = await user.getBlogPosts();
            const token = await authService({ email: adminData.email, password: adminData.password });
            supertest(server)
                .put(`${baseUrl}/blogposts/${blogPosts[0].id}`)
                .set('Accept', 'application/json')
                .set('Authorization', token)
                .send(data)
                .end(function(err, res) {
                    if (err) return done(err);
                    const { status, body } = res;

                    expect(body.blogPost.title).toBe(data.title);
                    expect(body.blogPost.content).toBe(data.content);
                    expect(body.blogPost.published).toBe(data.published);
                    expect(status).toEqual(201);
                    return done();
            });
        });
    });

    describe('deleteBlogPost', () => {
        it('should allow a user to delete his blogpost', async (done) => {
            const userData = {
                email: 'genaroconner@mail.com',
                password: 'KP>$62E@tWC*3/R9'
            };
            const user = await UserRepository.findByEmail(userData.email);
            const data = {
                title: 'New title',
                content: 'New content',
                published: true,
                author_id: user.id
            };
            const blogPost = await BlogPost.create(data);
            const token = await authService({ email: userData.email, password: userData.password });
            supertest(server)
                .delete(`${baseUrl}/blogposts/${blogPost.id}`)
                .set('Accept', 'application/json')
                .set('Authorization', token)
                .send(data)
                .end(function(err, res) {
                    if (err) return done(err);
                    const { status, body } = res;

                    expect(status).toEqual(200);
                    return done();
            });
        });

        it('should allow an admin to delete the blogpost of a user', async (done) => {
            const userData = {
                email: 'genaroconner@mail.com',
                password: 'KP>$62E@tWC*3/R9'
            };
            const user = await UserRepository.findByEmail(userData.email);
            const adminData = {
                email: 'annierichard@mail.com',
                password: '~&%xF"RT[wWJ>?q6'
            }
            const data = {
                title: 'New title',
                content: 'New content',
                published: true,
                author_id: user.id
            };
            const blogPost = await BlogPost.create(data);
            const token = await authService({ email: adminData.email, password: adminData.password });
            supertest(server)
                .delete(`${baseUrl}/blogposts/${blogPost.id}`)
                .set('Accept', 'application/json')
                .set('Authorization', token)
                .send(data)
                .end(function(err, res) {
                    if (err) return done(err);
                    const { status, body } = res;

                    expect(status).toEqual(200);
                    return done();
            });
        });

        it('should not allow a user to delete the blogpost of a another user', async (done) => {
            const userData = {
                email: 'genaroconner@mail.com',
                password: 'KP>$62E@tWC*3/R9'
            };
            const user = await UserRepository.findByEmail(userData.email);
            const otherUserData = {
                email: 'marvindominguez@mail.com',
                password: 'O3J6v]0W+qGPI8%(',
                firstname: 'Marvin',
                lastname: 'Dominguez',
                username: 'Spoillhou'
            };
            const data = {
                title: 'New title',
                content: 'New content',
                published: true,
                author_id: user.id
            };
            const blogPost = await BlogPost.create(data);
            await User.create(otherUserData);
            const token = await authService({ email: otherUserData.email, password: otherUserData.password });
            supertest(server)
                .delete(`${baseUrl}/blogposts/${blogPost.id}`)
                .set('Accept', 'application/json')
                .set('Authorization', token)
                .send(data)
                .end(function(err, res) {
                    if (err) return done(err);
                    const { status, body } = res;

                    expect(status).toEqual(401);
                    expect(body.error).toBe('unauthorized');
                    return done();
            });
        });
    });

    describe('findAllBlogPosts', () => {
        it('should return a list of published blogPosts', async (done) => {
            supertest(server)
                .get(`${baseUrl}/blogposts/`)
                .set('Accept', 'application/json')
                .end(function (err, res) {
                    if (err) return done(err);
                    const { status, body } = res;
                    const blogPosts = body.blogPosts;

                    expect(status).toEqual(200);
                    for (let i = 0; i < blogPosts.length; i++) {
                        expect(blogPosts[i].published).toBe(true);
                    }
                    return done();
            });
        });
    });

    describe('findBlogPostById', () => {
        it('should return a published blogPost of a user', async (done) => {
            const user = await UserRepository.findByEmail('genaroconner@mail.com');
            const blogPosts = await user.getBlogPosts();
            const publishedBlogPosts = blogPosts.filter(blogPost => blogPost.published === true);
            const id = publishedBlogPosts[0].id;
            supertest(server)
                .get(`${baseUrl}/blogposts/${id}`)
                .set('Accept', 'application/json')
                .end(function (err, res) {
                    if (err) return done(err);
                    const { status, body } = res;
                    const blogPost = body.blogPost;

                    expect(status).toEqual(200);
                    expect(blogPost.published).toBe(true);
                    return done();
            });
        });

        it('should not allow a user to see an unpublished blogPost of a user', async (done) => {
            const user = await UserRepository.findByEmail('genaroconner@mail.com');
            const blogPostData = {
                title: 'Super title',
                content: 'super content',
                published: false,
                author_id: user.id
            };
            const blogPost = await BlogPost.create(blogPostData);
            supertest(server)
                .get(`${baseUrl}/blogposts/${blogPost.id}`)
                .set('Accept', 'application/json')
                .end(function (err, res) {
                    if (err) return done(err);
                    const { status, body } = res;

                    expect(status).toEqual(401);
                    expect(body.error).toBe('unauthorized');
                    return done();
            });
        });

        it('should allow an admin to see an unpublished blogPost of a user', async (done) => {
            const user = await UserRepository.findByEmail('genaroconner@mail.com');
            const blogPosts = await user.getBlogPosts();
            const unpublishedBlogPosts = blogPosts.filter(blogPost => blogPost.published === false);
            const blogPost = unpublishedBlogPosts[0];
            const token = await authService({ email: 'annierichard@mail.com', password: '~&%xF"RT[wWJ>?q6' });
            supertest(server)
                .get(`${baseUrl}/blogposts/${blogPost.id}`)
                .set('Accept', 'application/json')
                .set('Authorization', token)
                .end(function (err, res) {
                    if (err) return done(err);
                    const { status, body } = res;

                    expect(status).toEqual(200);
                    expect(blogPost.published).toBe(false);
                    return done();
            });
        });
    });

    describe('findUserBlogPosts', () => {
        it('should return the list of published blogPost of a user', async (done) => {
            const user = await UserRepository.findByEmail('genaroconner@mail.com');
            supertest(server)
                .get(`${baseUrl}/users/${user.id}/blogPosts`)
                .set('Accept', 'application/json')
                .end(function (err, res) {
                    if (err) return done(err);
                    const { status, body } = res;

                    expect(status).toEqual(200);
                    for (let i = 0; i < body.blogPosts.length; i++) {
                        expect(body.blogPosts[i].published).toBe(true);
                    }
                    return done();
            });
        });

        it('should return the list of all blogPost of its owner', async (done) => {
            const user = await UserRepository.findByEmail('genaroconner@mail.com');
            const token = await authService({ email: user.email, password: 'KP>$62E@tWC*3/R9' });
            supertest(server)
                .get(`${baseUrl}/users/${user.id}/blogPosts`)
                .set('Accept', 'application/json')
                .set('Authorization', token)
                .end(function (err, res) {
                    if (err) return done(err);
                    const { status, body } = res;
                    expect(status).toEqual(200);
                    const unpublishedBlogPosts = body.blogPosts.filter(blogPost => blogPost.published === false);
                    const publishedBlogPosts = body.blogPosts.filter(blogPost => blogPost.published === true);

                    expect(unpublishedBlogPosts.length).toBeGreaterThanOrEqual(1);
                    expect(publishedBlogPosts.length).toBeGreaterThanOrEqual(1);
                    return done();
            });
        });

        it('should return the list of all blogPost of a user to an admin', async (done) => {
            const user = await UserRepository.findByEmail('genaroconner@mail.com');
            const token = await authService({ email: 'annierichard@mail.com', password: '~&%xF"RT[wWJ>?q6' });
            supertest(server)
                .get(`${baseUrl}/users/${user.id}/blogPosts`)
                .set('Accept', 'application/json')
                .set('Authorization', token)
                .end(function (err, res) {
                    if (err) return done(err);
                    const { status, body } = res;
                    expect(status).toEqual(200);
                    const unpublishedBlogPosts = body.blogPosts.filter(blogPost => blogPost.published === false);
                    const publishedBlogPosts = body.blogPosts.filter(blogPost => blogPost.published === true);
                    
                    expect(unpublishedBlogPosts.length).toBeGreaterThanOrEqual(1);
                    expect(publishedBlogPosts.length).toBeGreaterThanOrEqual(1);
                    return done();
            });
        });
    });
});
