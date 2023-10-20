'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const DataTypes = Sequelize.DataTypes
        await queryInterface.createTable("AttemptSessionPurpose", {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.STRING,
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

        await queryInterface.bulkInsert("AttemptSessionPurpose", [
            {
                id: 1,
                name: 'Email Verification',
                createdAt: new Date(),
                updatedAt: new Date(),
            }
        ])

        await queryInterface.createTable("AttemptSession", {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            purpose: {
                type: DataTypes.SMALLINT,
                allowNull: false,
                references: {
                    model: "AttemptSessionPurpose",
                    key: 'id',
                }
            },
            deviceId: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            attempt: {
                type: DataTypes.SMALLINT,
                allowNull: false,
            },
            lastAttempt: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            version: {
                type: DataTypes.INTEGER,
                allowNull: false,
            }
        })
    },

    async down(queryInterface, _) {
        await queryInterface.dropTable("AttemptSession")
        await queryInterface.dropTable("AttemptSessionPurpose")
    }
};
