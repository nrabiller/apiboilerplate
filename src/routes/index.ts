import express from 'express';
import userRoutes from './UserRoutes';
import blogPostRoutes from './BlogPostRoutes';

const router = express.Router();

const path = '/api/v1';
const apiRoutes = [...userRoutes, ...blogPostRoutes];

interface route {
    path: string,
    method: string,
    function: Function,
    middleware?: Function
};

apiRoutes.forEach((route: route) => {
    if (route.middleware) return router[route.method](`${path}${route.path}`, route.function, route.middleware);
    
    return router[route.method](`${path}${route.path}`, route.function);
});

export default router;
