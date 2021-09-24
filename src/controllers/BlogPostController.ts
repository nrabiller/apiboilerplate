import { create, edit, _delete, findAll, findBlogPostsByUserId, findById } from '../services/BlogPostService';
import { authorize } from '../services/UserService';

export const createBlogPost = async (req, res, next) => {
    try {
        const user = await authorize('visitor', req);
        await create(req.body, user).then(blogPost => {
            return res.status(201).json({
                success: true, blogPost
            });
        });
    } catch(e) {
        return next(e);
    }
}

export const editBlogPost = async (req, res, next) => {
    try {
        const user = await authorize('visitor', req);
        await edit(req.params.id, req.body, user).then(blogPost => {
            return res.status(201).json({
                success: true, blogPost
            });
        });
    } catch(e) {
        return next(e);
    }
}

export const deleteBlogPost = async (req, res, next) => {
    try {
        const user = await authorize('visitor', req);
        await _delete(req.params.id, user).then(() => {
            return res.status(200).json({ success: true });
        });
    } catch(e) {
        return next(e);
    }
}

export const findAllBlogPosts = async (req, res, next) => {
    try {
        await findAll().then(blogPosts => {
            return res.status(200).json({
                success: true, blogPosts
            });
        });

    } catch(e) {
        return next(e);
    }
}

export const findBlogPostById = async (req, res, next) => {
    try {
        await findById(req.params.id, req.headers.authorization).then(blogPost => {
            return res.status(200).json({
                success: true, blogPost
            });
        });
    } catch(e) {
        return next(e);
    }
}

export const findUserBlogPosts = async (req, res, next) => {
    try {
        await findBlogPostsByUserId(req.params.id, req.headers.authorization).then(blogPosts => {
            return res.status(200).json({
                success: true, blogPosts
            });
        });
    } catch(e) {
        return next(e);
    }
}
