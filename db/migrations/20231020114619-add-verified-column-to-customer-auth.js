'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const DataTypes = Sequelize.DataTypes
    await queryInterface.addColumn("CustomerAuth", "verified", {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    })
  },

  async down (queryInterface, _) {
    await queryInterface.removeColumn("CustomerAuth", "verified")
  }
};
