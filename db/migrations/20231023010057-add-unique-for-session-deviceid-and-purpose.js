'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, _) {
    await queryInterface.addConstraint("AttemptSession", {
      fields: ["deviceId", "purpose"],
      type: "unique",
      name: "device_id_purpose_unique"
    })
  },

  async down (queryInterface, _) {
    await queryInterface.removeConstraint("AttemptSession", "device_id_purpose_unique")
  }
};
