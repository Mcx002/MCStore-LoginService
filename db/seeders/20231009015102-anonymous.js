'use strict';

const randomstring = require('randomstring')
const { createHash } = require('crypto')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const date = new Date()

    const customerAnonymousPassword = randomstring.generate(6);
    const customerAnonymousPasswordEncrypted = createHash('sha256').update(customerAnonymousPassword).digest('hex')
    const customerAnonymous = {
      id: 1,
      xid: randomstring.generate(4),
      username: randomstring.generate(6),
      password: customerAnonymousPasswordEncrypted,
      level: 1,
      createdAt: date,
      updatedAt: date,
    }

    const sellerAnonymousPassword = randomstring.generate(6);
    const sellerAnonymousPasswordEncrypted = createHash('sha256').update(sellerAnonymousPassword).digest('hex')
    const sellerAnonymous = {
      id: 2,
      xid: randomstring.generate(4),
      username: randomstring.generate(6),
      password: sellerAnonymousPasswordEncrypted,
      level: 2,
      createdAt: date,
      updatedAt: date,
    }

    const adminAnonymousPassword = randomstring.generate(6);
    const adminAnonymousPasswordEncrypted = createHash('sha256').update(adminAnonymousPassword).digest('hex')
    const adminAnonymous = {
      id: 3,
      xid: randomstring.generate(4),
      username: randomstring.generate(6),
      password: adminAnonymousPasswordEncrypted,
      level: 3,
      createdAt: date,
      updatedAt: date,
    }

    await queryInterface.bulkInsert('Anonymous', [
        customerAnonymous, sellerAnonymous, adminAnonymous
    ])
    console.log('--------')
    console.log()

    console.log("customer anonymous")
    console.log(`username ${customerAnonymous.username}`)
    console.log(`password ${customerAnonymousPassword}`)
    console.log('--------')
    console.log()

    console.log("seller anonymous")
    console.log(`username ${sellerAnonymous.username}`)
    console.log(`password ${sellerAnonymousPassword}`)
    console.log('--------')
    console.log()

    console.log("admin anonymous")
    console.log(`username ${adminAnonymous.username}`)
    console.log(`password ${adminAnonymousPassword}`)
    console.log('--------')
    console.log()
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Anonymous', {
      id: [1,2,3]
    })
  }
};
