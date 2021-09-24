import User from '../entities/user';

export class UserRepository {
    static async findByEmail (email: string): Promise<User> {
        return await User.findOne({ where: 
            { email }
        });
    }
}
