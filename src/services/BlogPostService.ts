import BlogPost from '../entities/blog-post';
import { BlogPostRepository } from '../repositories/BlogPostRepository';
import errorHandler from '../_helpers/error-handler';
import { identifyUser } from './UserService';
import { MAXTITLELENGTH, MAXCONTENTLENGTH } from '../entities/blog-post';

export const create = async (params: { title: string, content: string, published: boolean }, user ) => {
    if (!user.id || user.id === undefined) throw new errorHandler('cannot find user', 500);
    params['author_id'] = user.id;
    validateBlogPost(params);
    const blogPost = { title: params.title, content: params.content, author_id: user.id, published: params.published }
    return await BlogPost.create(blogPost);
}

export const edit = async (id: number, params: { title: string, content: string, published: boolean }, user ) => {
    const blogPost = await BlogPost.findByPk(id);
    if (!blogPost) throw new errorHandler('cannot find blogPost', 500);
    if (user.id !== blogPost.author_id && user.role !== 'admin') throw new errorHandler('unauthorized', 401);
        validateBlogPost(params);
        blogPost.title = params.title;
        blogPost.content = params.content;
        blogPost.published = params.published;
        return await blogPost.save();
}

export const _delete = async (id: number, user) => {
    const blogPost = await BlogPost.findByPk(id);
    if (!blogPost) throw new errorHandler('cannot find blogPost', 400);
    if (blogPost.author_id !== user.id && user.role !== 'admin') throw new errorHandler('unauthorized', 401);
    return blogPost.destroy();
}

export const findAll = async () => {
    const blogPosts = await BlogPost.findAll();
    const publishedBlogPosts = blogPosts.filter(blogPost => {
        return blogPost.published == true
    });
    return publishedBlogPosts;
}

export const findById = async (id: number, token?) => {
    const blogPost = await BlogPost.findByPk(id);
    if (!blogPost) throw new errorHandler('cannot find blogpost', 400);
    if (token) {
        const user = await identifyUser(token);
        if (user.role === 'admin' || blogPost.author_id === user.id)
        return blogPost;
    } else if (blogPost.published) {
        return blogPost;
    } else {
        throw new errorHandler('unauthorized', 401);
    }
}

export const findBlogPostsByUserId = async (id: number, token?) => {
    if (token) {
        const user = await identifyUser(token);
        if (user.id == id || user.role === 'admin') {
            const blogPosts =  await BlogPostRepository.findByUserId(id);
            return blogPosts
        }
    }
    return await BlogPostRepository.findPublishedByUserId(id);
}

export const validateBlogPost = (params: { title: string, content: string, published: boolean }) => {
    if (params.title.length == 0 && params.published) throw new errorHandler('you cannot publish a blogPost with no title', 400);
    if (params.title.length > MAXTITLELENGTH) throw new errorHandler(`title can contain ${MAXTITLELENGTH} characters maximum`, 400);
    if (params.content.length == 0 && params.published) throw new errorHandler('you cannot publish a blogPost with no content', 400);
    if (params.content.length > MAXCONTENTLENGTH) throw new errorHandler(`content can contain ${MAXCONTENTLENGTH} characters maximum`, 400);
}
