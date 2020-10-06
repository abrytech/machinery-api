'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      firstName: {
        type: Sequelize.STRING
      },
      lastName: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      username: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      userType: {
        type: Sequelize.ENUM,
        values: ['Machinery Owner', 'Lowbed Owner', 'Admin'],
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM,
        values: ['Admin', 'User'],
        defaultValue: 'User'
      },
      activationKey: Sequelize.STRING,
      isActivated: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      isApproved: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      deleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      spam: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Users')
  }
}
