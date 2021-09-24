import { DataTypes, HasOneGetAssociationMixin, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelizeConfig';
import User from './user';

export const MAXTITLELENGTH = 200;
export const MAXCONTENTLENGTH = 6000;

interface BlogPostAttributes {
  id: number;
  title: string;
  content: string;
  published: boolean;
  author_id: number;
}

interface BlogPostCreationAttributes extends Optional<BlogPostAttributes, 'id'> {}

class BlogPost extends Model<BlogPostAttributes, BlogPostCreationAttributes> implements BlogPostAttributes {
  public id!: number;
  public title!: string;
  public content!: string;
  public published!: boolean;
  public author_id!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public getUser!: HasOneGetAssociationMixin<User>;
}

BlogPost.init({
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      field: 'blogpost_id',
      autoIncrement: true,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: true,
      validate: {
        len: [0, MAXTITLELENGTH]
      },
      field: 'title'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, MAXCONTENTLENGTH]
      },
      field: 'content'
    },
    published: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'published',
      defaultValue: false
    },
    author_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    }
}, {
    sequelize: sequelize,
    modelName: 'BlogPost'
});

export default BlogPost;
