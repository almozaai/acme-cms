const Sequelize = require('sequelize');

const conn = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/acme_cms_db');

const Page = conn.define('page', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        noEmpty: true
    }
})

Page.belongsTo(Page, { as: 'parent'});
Page.hasMany(Page, { as: 'children', foreignKey: 'parentId' });

const mapAndSave = (pages) => Promise.all(pages.map(page => Page.create(page)));

const syncAndSeed = async() =>{
    await conn.sync({ force: true });

    const home = await Page.create({ title: 'Home Page' });

    let pages = [
        { title: 'About', parentId: home.id },
        { title: 'Contact', parentId: home.id }
    ];
    const [about, contact] = await mapAndSave(pages);

    pages = [
        { title: 'About Our Team', parentId: about.id },
        { title: 'About Our History', parentId: about.id },
        { title: 'Phone', parentId: contact.id },
        { title: 'Fax', parentId: contact.id }
    ];

    const [team, history, phone, fax] = await mapAndSave(pages);
}

module.exports = {
    syncAndSeed,
    models: {
        Page
    }
}