import User from '../../entities/user';
import BlogPost from '../../entities/blog-post';

const dropDatabase = async () => {
    await BlogPost.drop();
    await User.drop();
};

try {
    dropDatabase();
} catch(e) {
    console.error(e);
}
