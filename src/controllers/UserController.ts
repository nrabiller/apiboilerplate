import jwt from 'jsonwebtoken';
import config from '../config/config.json';
import { authService, userRegister, findAll, sendResetPassword, _delete, editUser, authorize, identifyUser, findById } from "../services/UserService";
import errorHandler from '../_helpers/error-handler';

export const signUp = async (req, res, next) => {
    try {
        const user = await userRegister(req.body);
        const data = { email: req.body['email'], password: req.body['password'] };
        await authService(data).then(token => {
            return res.status(201).json({
                sucess: true,
                user,
                token
            });
        });
    } catch(e) {
        return next(e);
    }
}

export const getAll = async (req, res, next) => {
    try {
        const users = await findAll();
        return res.status(200).json({ sucess: true, users });
    } catch(e) {
        return next(e);
    }
}

export const getById = async (req, res, next) => {
    try {
        return await findById(req.params.id).then(user => {
            return res.status(200).json({ success: true, user });
        });
    } catch(e) {
        return next(e);
    }
}

export const login = async (req, res, next) => {
    try {
        await authService({ email: req.body['email'], password: req.body['password']}).then(token => {
            return res.status(200).json({
                sucess: true,
                token
            });
        });
    } catch(e) {
        return next(e);
    }
}

export const forgotPassword = async (req, res, next) => {
    try {
        await sendResetPassword(req.body.email).then(() => {
            return res.status(200).json({ success: true })
        });
    } catch(e) {
        return next(e);
    }
}

export const editPassword = async (req, res, next) => {
    try {
        const user = await identifyUser(req.params.token);
        await editUser(req.params.id, req.body, user).then((user) => {
            return res.status(201).json({
                success: true,
                user
            });
        });
    } catch(e) {
        return next(e);
    }
}

export const edit = async (req, res, next) => {
    try {
        const user = await authorize('visitor', req);
       
        await editUser(req.params.id, req.body, user).then((user) => {
            return res.status(201).json({
                success: true,
                user
            });
        });
    } catch(e) {
        return next(e);
    }
}

export const deleteUser = async (req, res, next) => {
    try {
        await authorize('visitor', req);

        await _delete(req.params.id, req.headers.authorization).then(() => {
            return res.status(200).json({ success: true });
        });
    } catch(e) {
        return next(e);
    }
}

export const getFormResetPassword = async (req, res, next) => {
    try {
        if (req.params.token === null || req.params.token === undefined) throw new errorHandler('no token received', 500);
        const token = req.params.token;
        const user = jwt.verify(token, config.jwt_secret);
        return res.status(200).json({ success: true, user, token })
    } catch(e) {
        return next(e);
    }
}
