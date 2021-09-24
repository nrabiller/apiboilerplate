import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserRepository }  from '../repositories/UserRepository';
import { emailIsValid } from '../_helpers/email-validation';
import User, { MAXFIRSTNAMELENGTH, MAXLASTNAMELENGTH, MAXPASSWORDLENGTH, MAXUSERNAMELENGTH, MINFIRSTNAMELENGTH, MINLASTNAMELENGTH, MINPASSWORDLENGTH, MINUSERNAMELENGTH } from '../entities/user';
import config from '../config/config.json';
import { sendEmail } from '../_helpers/send-email';
import errorHandler from '../_helpers/error-handler';

interface UserData {
    email? : string,
    username?: string,
    firstname?: string,
    lastname?: string,
    password?: string
}

export const authorize = async (role: string, req) => {
    if (req.headers.authorization === undefined) throw new errorHandler('no connected user', 401);
    const userFromToken = await identifyUser(req.headers.authorization);
    if (role === 'admin' && userFromToken.role !== 'admin') {
        throw new errorHandler('unauthorized', 401);
    }
    return userFromToken;
}

export async function authService(params: { email: string, password: string }) {
    const user = await UserRepository.findByEmail(params.email)
    if (!user) {
        throw new errorHandler('User not found', 400);
    }
    if (user.email !== params.email) {
        throw new errorHandler('Authentication failed. User not found.', 400);
    }        
    if (!bcrypt.compareSync(params.password, user.password)) {
        throw new errorHandler('incorrect password', 400);
    }

    return generateJwtToken(params);
}

export const userRegister = async (data: UserData) => {
    const { email, username, firstname, lastname, password } = data;

    if (!email) throw new errorHandler('email is required', 400);
    if (!username) throw new errorHandler('username is required', 400);
    if (!firstname) throw new errorHandler('firstname is required', 400);
    if (!lastname) throw new errorHandler('lastname is required', 400);

    await validateUser(data);

    const user = await User.create({
        email,
        username,
        lastname,
        firstname,
        password
    });

    return user;
}

export const _delete = async (id: number, authorization: string): Promise<void> => {
    if (!id || id === null) throw new errorHandler('id is missing', 400);
    if (authorization === undefined) throw new errorHandler('no connected user', 401);
    const userFromToken = await identifyUser(authorization);
    const user = await User.findByPk(id);
    if (userFromToken['id'] !== user.id) {
        if (userFromToken.role !== 'admin') throw new errorHandler('unauthorized', 401);
    }
    await user.destroy();
}

export const findAll = async () => {
    const users = await User.findAll();
    const usersToReturn = users.map(({ id, email, firstname, lastname, username, role, verified, createdAt, updatedAt }) => ({ id, email, firstname, lastname, username, role, verified, createdAt, updatedAt }));
    return usersToReturn;
}

export const findById = async (id: number) => {
    if (!id || id === null || id === undefined) throw new errorHandler('cannot read id', 400);
    const user = await User.findByPk(id);
    if (!user) throw new errorHandler('cannot find User', 500);
    const data = { 
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role
    }
    return data;
}

export const verifyEmail = async (email: string): Promise<void> => {
    const user = await UserRepository.findByEmail(email);
    if (!user) throw new errorHandler('email not found', 400);
    user.verified = new Date();
    await user.save();
}

export const sendResetPassword = async (email: string, info?: boolean) => {
    try {
        const token = jwt.sign({ email }, config.jwt_secret, { expiresIn: '1h' });
        const url = `127.0.0.1:4000/api/v1/users/reset-password?token=${token}`;
        const message = `<p>Please click on the link below to reset your password. The link is available for one hour.</p>
                        <a href=${url}>${url}</a>`;
        if (info) {
            return await sendEmail({
                to: email,
                subject: 'Password reset',
                html: message
            }, true);
        } else {
             await sendEmail({
                to: email,
                subject: 'Password reset',
                html: message
            });
        }
    } catch(e) {
        throw new errorHandler(e, 400);
    }
}

export const editUser = async (id: number, params: UserData, user: User): Promise<User> => {
    const userFromId = await User.findByPk(id);
    if (user['id'] !== userFromId.id) {
        if (user.role !== 'admin') throw new errorHandler('unauthorized', 401);
    }
    await validateUser(params, id);
    Object.keys(params).forEach(el => {
        const allowedParams = ['email', 'firstname', 'lastname', 'password', 'username'];
        if (allowedParams.includes(el) || user.role == 'admin') {
            userFromId[el] = params[el];
        } else {
            return;
        }
    });
    await userFromId.save();
    return userFromId;
}

export const identifyUser = async (authorization): Promise<User> => {
    let token: string;
    if (authorization.split(' ')[0] == 'JWT') {
        token = authorization.split(' ')[1];
    } else {
        token = authorization;
    }
    
    try {
        const userFromToken = jwt.verify(token, config.jwt_secret);
        return await UserRepository.findByEmail(userFromToken['email']);
    } catch(e) {
        throw new errorHandler('unauthorized', 500);
    }
}

export async function generateJwtToken(user) {
    return `JWT ${jwt.sign({ id: user.id, email: user.email, username: user.username , firstname: user.firstname, lastname: user.lastname } , config.jwt_secret)}`;
}

export const validateUser = async (data: UserData, id?: number) => {
    const { email, username, firstname, lastname, password } = data;

    if (id) {
        const user = await User.findByPk(id);
        email ? await checkExistingEmaill(email, user) : null;
        username ? await checkExistingUsername(username, user) : null;
    } else {
        email ? await checkExistingEmaill(email) : null;
        username ? await checkExistingUsername(username) : null;
    }
    if (username) {
        if (username.includes(' ')) {
            throw new errorHandler('username should not include a space character', 400);
        }
        if (username.length < MINUSERNAMELENGTH || username.length > MAXUSERNAMELENGTH) {
            throw new errorHandler(`username should have a length between ${MINUSERNAMELENGTH} and ${MAXUSERNAMELENGTH} characters.`, 400);
        }
        validateField('username', username);
    }
    if (lastname) {
        if (lastname.length < MINLASTNAMELENGTH || lastname.length > MAXLASTNAMELENGTH ) {
            throw new errorHandler(`lastname should have a length between ${MINLASTNAMELENGTH} and ${MAXLASTNAMELENGTH} characters.`, 400);
        }
        if (lastname.includes(' ')) {
            throw new errorHandler('lastname should not include a space character', 400);
        }
        validateField('lastname', lastname);
    }
    if (firstname) {
        if (firstname !== undefined && firstname.length < MINFIRSTNAMELENGTH || firstname !== undefined && firstname.length > MAXFIRSTNAMELENGTH ) {
            throw new errorHandler(`firstname should have a length between ${MINFIRSTNAMELENGTH} and ${MAXFIRSTNAMELENGTH} characters.`, 400);
        }
        if (firstname !== undefined && firstname.includes(' ')) {
            throw new errorHandler('firstname should not include a space character', 400);
        }
        validateField('firstname', firstname);
    }
    if (email) {
        if (email !== undefined && !emailIsValid(email)) {
            throw new errorHandler('email is not valid.', 400)
        }
    }
    if (password) {
        if (password !== undefined && password.length < MINPASSWORDLENGTH || password !== undefined && password.length > MAXPASSWORDLENGTH) {
            throw new errorHandler(`password should have a length between ${MINPASSWORDLENGTH} and ${MAXPASSWORDLENGTH} characters.`, 400);
        }
        validatePassword(password);
    }
}

export const checkExistingEmaill = async (email, user?) => {
    const existingEmail = await User.findOne({ where: { email } });
    if (!user) {
        if (existingEmail) {
            throw new errorHandler('email already used', 400);
        }
    }
    if (existingEmail && user.email !== existingEmail.email) {
        throw new errorHandler('email already used', 400);
    }
}

export const checkExistingUsername = async (username, user?) => {
    const existingUsername = await User.findOne({ where: { username } });
    if (!user) {
        if (existingUsername) {
            throw new errorHandler('username already used', 400);
        }
    }
    if (existingUsername && user.username !== existingUsername.username) {
        throw new errorHandler('username already used', 400);
    }
}

export const validatePassword = (password: string) => {
    const lowerCase = /[a-z]/g;
    const uppperCase = /[A-Z]/g;
    const numerical = /[0-9]/g;
    const specialCharacter = /\W|_/g;
    if (!lowerCase.test(password)) throw new errorHandler('password should contain at least one lowercase character', 400);
    if (!uppperCase.test(password)) throw new errorHandler('password should contain at least one uppercase character', 400);
    if (!numerical.test(password)) throw new errorHandler('password should contain at least one numerical character', 400);
    if (!specialCharacter.test(password)) throw new errorHandler('password should contain at least one special character', 400);
}

export const validateField = (field: string, value: string) => {
    if (value.length == 0) throw new errorHandler(`${field} is required`, 400);
    const allowedCharacters = /^[a-zA-Z0-9\-_]+$/g;
    if(!allowedCharacters.test(value)) throw new errorHandler(`only alphanumeric characters are allowed for ${field}`, 400);
}
