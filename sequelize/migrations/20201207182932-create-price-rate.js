'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('PriceRates', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      isDefault: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      discoutBy: {
        type: Sequelize.STRING,
        defaultValue: 'percent'
      },
      discountAmount: {
        type: Sequelize.DOUBLE
      },
      weightPrice: {
        type: Sequelize.DOUBLE,
        allowNull: false
      },
      onRoadPrice: {
        type: Sequelize.DOUBLE,
        allowNull: false
      },
      offRoadPrice: {
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
    await queryInterface.dropTable('PriceRates')
  }
}
