import { createBlogPost, deleteBlogPost, editBlogPost, findAllBlogPosts, findBlogPostById } from '../controllers/BlogPostController';

const path = '/blogposts';

const blogPostRoutes = [
    { path: `${path}/`, method: 'post', function: createBlogPost },
    { path: `${path}/:id`, method: 'put', function: editBlogPost },
    { path: `${path}/:id`, method: 'delete', function: deleteBlogPost },
    { path: `${path}/`, method: 'get', function: findAllBlogPosts },
    { path: `${path}/:id`, method: 'get', function: findBlogPostById },
];

export default blogPostRoutes;
