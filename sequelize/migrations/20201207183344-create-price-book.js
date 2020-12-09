'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('PriceBooks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      jobId: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      priceRateId: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      estimatedPrice: {
        type: Sequelize.DOUBLE
      },
      actualPrice: {
        type: Sequelize.DOUBLE
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
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('PriceBooks')
  }
}
