'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Addresses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      kebele: {
        allowNull: false,
        type: Sequelize.STRING
      },
      woreda: {
        allowNull: false,
        type: Sequelize.STRING
      },
      zone: {
        allowNull: false,
        type: Sequelize.STRING
      },
      city: {
        allowNull: false,
        type: Sequelize.STRING
      },
      lat: { type: Sequelize.FLOAT },
      long: { type: Sequelize.FLOAT },
      company: {
        type: Sequelize.STRING,
        unique: true
      },
      phone: {
        type: Sequelize.STRING,
        unique: true
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
    return queryInterface.dropTable('Addresses')
  }
}
