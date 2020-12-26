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
      kebele: { type: Sequelize.STRING },
      woreda: { type: Sequelize.STRING },
      zone: { type: Sequelize.STRING },
      city: { type: Sequelize.STRING },
      region: { type: Sequelize.STRING },
      lat: { type: Sequelize.DOUBLE },
      long: { type: Sequelize.DOUBLE },
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
