'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Machinery', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      machineId: {
        type: Sequelize.INTEGER
      },
      madeIn: {
        type: Sequelize.STRING
      },
      manufacturingYear: {
        type: Sequelize.INTEGER
      },
      licensePlate: {
        type: Sequelize.STRING
      },
      motorNo: {
        type: Sequelize.STRING
      },
      chassieNo: {
        type: Sequelize.STRING
      },
      modelNo: {
        type: Sequelize.STRING
      },
      weight: {
        type: Sequelize.FLOAT
      },
      width: {
        type: Sequelize.FLOAT
      },
      height: {
        type: Sequelize.FLOAT
      },
      length: {
        type: Sequelize.FLOAT
      },
      tyreNo: {
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER
      },
      loadingCapacity: {
        type: Sequelize.FLOAT
      },
      withJackHammer: {
        type: Sequelize.BOOLEAN
      },
      serialNo: {
        type: Sequelize.STRING
      },
      horsePower: {
        type: Sequelize.FLOAT
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
    return queryInterface.dropTable('Machinery')
  }
}
