// const { Sequelize } = require('sequelize');
import { Sequelize } from "sequelize";
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './storage/data.db'
});
// module.exports = sequelize;
export default sequelize;