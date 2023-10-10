'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const DataTypes = Sequelize.DataTypes
        await queryInterface.createTable('Anonymous', {
            id: {
                type: DataTypes.SMALLINT,
                allowNull: false,
                primaryKey: true,
            },
            xid: {
                type: DataTypes.STRING(4),
                allowNull: false,
                unique: true,
            },
            username: {
                type: DataTypes.STRING(6),
                allowNull: false,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            level: {
                type: DataTypes.SMALLINT,
                allowNull: false,
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
            }
        })
    },

    async down(queryInterface, _) {
        await queryInterface.dropTable('Anonymous')
    }
};
