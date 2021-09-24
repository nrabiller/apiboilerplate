import app from './config/app';
import apiRouter from '../src/routes';
import router from '../src/routes';
import config from './config/config.json';
import errorHandler from './_helpers/error-handler';

app.use('/api/v1/', apiRouter);

app.use(router);

app.use(function (err, req, res, next) {
    if (process.env.NODE_ENV === 'development') console.error(err.stack);
    if (err instanceof errorHandler) {
        res.status(err.status).json({ success: false, error: err.message });
    } else {
        res.status(500).json({ success: false, error: err });
    }
});

const server = app.listen(config.port, () => {
    try {
        console.log(`
        Server running on port: ${config.port}
        ---
        Running on ${process.env.NODE_ENV}
        `);
    } catch (err) {
        throw err;
    }
});

export default server;
