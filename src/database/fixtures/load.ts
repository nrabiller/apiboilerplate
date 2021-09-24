import { LoremIpsum } from 'lorem-ipsum';
import User from '../../entities/user';
import sequelize from '../../config/sequelizeConfig';
import BlogPost from '../../entities/blog-post';

sequelize.sync({ force: true }).then(async () => {
    const user1 = {
        email: 'bufordwillis@mail.com',
        firstname: 'Willis',
        lastname: 'Buford',
        username: 'spidergood',
        password: 'PJMtRK`2\D0lf9v7'
    };

    const user2 = {
        email: 'murrayleonard@mail.com',
        firstname: 'Leonard',
        lastname: 'Murray',
        username: 'Amadevoya',
        password: 'g4<sPJ+\W2G)ny-7'
    };

    const user3 = {
        email: 'doylepacheco@mail.com',
        firstname: 'Pacheco',
        lastname: 'Doyle',
        username: 'Arani',
        password: 'N)|DK{J1IL!hX@&4'
    };

    const user4 = {
        email: 'gabrielavila@mail.com',
        firstname: 'Avila',
        lastname: 'Gabriel',
        username: 'Tighthe',
        password: '*_W.3x>+7?LGtnfh'
    };

    const user5 = {
        email: 'artnelson@mail.com',
        firstname: 'nelson',
        lastname: 'art',
        username: 'Cyog',
        password: '.Md2`<Wzcr?V+~x^'
    };

    const user6 = {
        email: 'ramirodavies@mail.com',
        firstname: 'Davies',
        lastname: 'Ramiro',
        username: 'PopMadd',
        password: '|Sa-Ar2]MTQ;Rbwj'
    };

    const user7 = {
        email: 'altheadunlap@mail.com',
        firstname: 'Dunlap',
        lastname: 'Althea',
        username: 'Amazewor',
        password: '`CWlzPSm|i06Mj/g'
    };

    const user8 = {
        email: 'georgiavaughan@mail.com',
        firstname: 'Vaughan',
        lastname: 'Georgia',
        username: 'HulkFerdy',
        password: ',[xfP&b6T9ViB@{W'
    };

    const user9 = {
        email: 'admin@mail.com',
        firstname: 'admin',
        lastname: 'admin',
        username: 'admin',
        password: 'DzmaZZJ@11',
        role: 'admin'
    }

    const users = [user1, user2, user3, user4, user5, user6, user7, user8, user9];

    for (let i = 0; i < users.length; i ++) {
        await User.create(users[i]).then(async (u) => {
            const lorem = new LoremIpsum({
                sentencesPerParagraph: { max: 8, min: 2 },
                wordsPerSentence: { max: 12, min: 4 }
            });
            const blogPostUnPublished = {
                title: lorem.generateSentences(1),
                content: lorem.generateParagraphs(4),
                published: false,
                author_id: u.id
            };
            const blogPost1 = {
                title: lorem.generateSentences(1),
                content: lorem.generateParagraphs(8),
                published: true,
                author_id: u.id
            };
            const blogPost2 = {
                title: lorem.generateSentences(1),
                content: lorem.generateParagraphs(6),
                published: true,
                author_id: u.id
            };
            await BlogPost.create(blogPostUnPublished).catch(e => console.error(e));
            await BlogPost.create(blogPost1).catch(e => console.error(e));
            await BlogPost.create(blogPost2).catch(e => console.error(e));
        }).catch(e => console.error(e));
    }
});
