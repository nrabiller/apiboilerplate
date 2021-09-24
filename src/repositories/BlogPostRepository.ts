import BlogPost from '../entities/blog-post';

export class BlogPostRepository {
    static async findByUserId (id: number): Promise<BlogPost[]> {
        return await BlogPost.findAll({ where: 
            { author_id: id }
        });
    }

    static async findPublishedByUserId (id: number): Promise<BlogPost[]> {
        return await BlogPost.findAll({ where: 
            { author_id: id, published: true }
        });
    }
}
