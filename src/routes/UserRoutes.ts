import { edit, getAll, login, signUp, deleteUser, editPassword, forgotPassword, getFormResetPassword, getById } from '../controllers/UserController';
import { findUserBlogPosts } from '../controllers/BlogPostController';

const path = '/users';

const userRoutes = [
    { path: `${path}/signup`, method: 'post', function: signUp },
    { path: `${path}/`, method: 'get', function: getAll },
    { path: `${path}/login`, method: 'post', function: login },
    { path: `${path}/:id`, method: 'put', function: edit },
    { path: `${path}/forgot-password`, method: 'post', function: forgotPassword },
    { path: `${path}/:id/:token`, method: 'put', function: editPassword },
    { path: `${path}/:id`, method: 'delete', function: deleteUser },
    { path: `${path}/reset-password/:token`, method: 'get', function: getFormResetPassword },
    { path: `${path}/:id/blogposts`, method: 'get', function: findUserBlogPosts },
    { path: `${path}/:id`, method: 'get', function: getById },
];

export default userRoutes;
