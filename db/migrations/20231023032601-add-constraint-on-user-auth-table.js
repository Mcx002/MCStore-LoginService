'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, _) {
    await queryInterface.removeConstraint("UserAuth", "CustomerAuth_userId_key")
    await queryInterface.removeConstraint("UserAuth", "UserAuth_userId_key")
    await queryInterface.addConstraint("UserAuth", {
      fields: ["email", "subjectType"],
      name: "email_subject_type_unique",
      type: "unique"
    })
  },

  async down (queryInterface, _) {
    await queryInterface.removeConstraint("UserAuth", "email_subject_type_unique")
    await queryInterface.addConstraint("UserAuth", {
      fields: ["userId"],
      name: "CustomerAuth_userId_key",
      type: "unique"
    })
    await queryInterface.addConstraint("UserAuth", {
      fields: ["userId"],
      name: "UserAuth_userId_key",
      type: "unique"
    })
  }
};
