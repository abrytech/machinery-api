'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Jobs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING(1000)
      },
      pickUpDate: {
        type: Sequelize.DATE
      },
      dropOffpDate: {
        type: Sequelize.DATE
      },
      pickUpAddress: {
        type: Sequelize.STRING
      },
      dropOffAddress: {
        type: Sequelize.STRING
      },
      userId: {
        type: Sequelize.INTEGER
      },
      machineId: {
        type: Sequelize.INTEGER
      },
      weight: {
        type: Sequelize.FLOAT
      },
      length: {
        type: Sequelize.FLOAT
      },
      width: {
        type: Sequelize.FLOAT
      },
      height: {
        type: Sequelize.FLOAT
      },
      quantity: {
        type: Sequelize.INTEGER
      },
      distance: {
        type: Sequelize.FLOAT
      },
      offRoadDistance: {
        type: Sequelize.FLOAT
      },
      hasOffroad: {
        type: Sequelize.BOOLEAN
      },
      status: {
        type: Sequelize.STRING
      },
      pictureId: Sequelize.INTEGER,
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
    return queryInterface.dropTable('Jobs')
  }
}
