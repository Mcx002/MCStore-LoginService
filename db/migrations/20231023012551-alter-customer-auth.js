'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const DataTypes = Sequelize.DataTypes
    await queryInterface.createTable("SubjectType", {
      id: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      version: {
        type: DataTypes.SMALLINT,
        allowNull: false
      }
    })
    await queryInterface.bulkInsert("SubjectType", [
      {
        id: 1,
        name: "Customer",
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
      },
      {
        id: 2,
        name: "Seller",
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
      },
      {
        id: 3,
        name: "Admin",
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
      }
    ])

    await queryInterface.renameTable("CustomerAuth", "UserAuth")
    await queryInterface.addColumn("UserAuth", "subjectType", {
      type: DataTypes.SMALLINT,
      allowNull: false,
      references: {
        model: "SubjectType",
        key: "id"
      },
      defaultValue: 1
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("UserAuth", "subjectType")
    await queryInterface.dropTable("SubjectType")
    await queryInterface.renameTable("UserAuth", "CustomerAuth")
  }
};
