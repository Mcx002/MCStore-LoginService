'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const DataTypes = Sequelize.DataTypes
    await queryInterface.changeColumn("UserAuth", "userId", {
      type: DataTypes.STRING(36),
      allowNull: false,
    })
  },

  async down(queryInterface, Sequelize) {
    const DataTypes = Sequelize.DataTypes
    await queryInterface.removeColumn("UserAuth", "userId")
    await queryInterface.addColumn("UserAuth", "userId", {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 1,
    })
  }
};
