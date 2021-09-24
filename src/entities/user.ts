import bcrypt from 'bcryptjs';
import { DataTypes, HasManyAddAssociationMixin, HasManyCountAssociationsMixin, HasManyCreateAssociationMixin, HasManyGetAssociationsMixin, HasManyHasAssociationMixin, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelizeConfig';
import BlogPost from './blog-post';

export const MINFIRSTNAMELENGTH = 2;
export const MAXFIRSTNAMELENGTH = 40;
export const MINLASTNAMELENGTH = 2;
export const MAXLASTNAMELENGTH = 40;
export const MINUSERNAMELENGTH = 2;
export const MAXUSERNAMELENGTH = 40;
export const MINPASSWORDLENGTH = 8;
export const MAXPASSWORDLENGTH = 60;

interface UserAttributes {
  id: number;
  email: string;
  lastname: string;
  firstname: string;
  username: string;
  password: string;
  role: string;
  verified: Date | null;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'role' | 'verified'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public email!: string;
  public lastname!: string;
  public firstname!: string;
  public username!: string;
  public password!: string;
  public role!: string;
  public verified!: Date | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public getBlogPosts!: HasManyGetAssociationsMixin<BlogPost>;
  public addBlogPost!: HasManyAddAssociationMixin<BlogPost, number>;
  public hasBlogPost!: HasManyHasAssociationMixin<BlogPost, number>;
  public countBlogPosts!: HasManyCountAssociationsMixin;
  public createBlogPost!: HasManyCreateAssociationMixin<BlogPost>;

  public readonly blogPosts?: BlogPost[];
}

User.init({
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      field: 'user_id',
      autoIncrement: true,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(128),
      unique: true,
      allowNull: false,
      field: 'email',
      validate: {
        isEmail: true,
      }},
    lastname: {
      type: DataTypes.STRING(MAXLASTNAMELENGTH),
      allowNull: false,
      validate: {
        len: [MINLASTNAMELENGTH, MAXLASTNAMELENGTH],
        notContains: ' '
      },
      field: 'lastname'
    },
    firstname: {
      type: DataTypes.STRING(MAXFIRSTNAMELENGTH),
      allowNull: false,
      validate: {
        len: [MINFIRSTNAMELENGTH, MAXFIRSTNAMELENGTH],
        notContains: ' '
      },
      field: 'firstname'
    },
    username: {
      type: DataTypes.STRING(MAXUSERNAMELENGTH),
      allowNull: false,
      validate: {
        len: [MINUSERNAMELENGTH, MAXUSERNAMELENGTH],
        notContains: ' '
      },
      field: 'username',
      unique: true,
    },
    password: {
      type: DataTypes.STRING(MAXPASSWORDLENGTH),      
      field: 'password',
      validate: {
        len: [MINPASSWORDLENGTH, MAXPASSWORDLENGTH],
        notContains: ' '
      },
      set(val: string)  {
        if (val.length >= MINPASSWORDLENGTH || val.length <= MAXPASSWORDLENGTH) {
          let salt = bcrypt.genSaltSync(10);
          this.setDataValue('password', bcrypt.hashSync(val, salt));
        } else {
          throw new Error(`password should have a length between ${MINPASSWORDLENGTH} and ${MAXPASSWORDLENGTH} characters`)
        }
      },
      allowNull: false,
    },
    verified: {
      type: DataTypes.DATE,
      defaultValue: null,
      field: 'verified'
    },
    role: { 
      type: DataTypes.STRING(28),
      defaultValue: 'visitor',
      validate: {
        isIn: [['visitor', 'admin']],
      },
      allowNull: false
    },
    }, {
      sequelize: sequelize,
      modelName: 'User'
});

User.hasMany(BlogPost, {
  sourceKey: 'id',
  foreignKey: 'author_id',
  as: 'blogPosts'
});

export default User;
