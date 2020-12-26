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
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.STRING(1000)
      },
      pickUpDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      dropOffpDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      pickUpId: {
        type: Sequelize.INTEGER
      },
      dropOffId: {
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER
      },
      machineryId: {
        type: Sequelize.INTEGER
      },
      quantity: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      distance: {
        type: Sequelize.DOUBLE,
        allowNull: false
      },
      offRoadDistance: {
        type: Sequelize.DOUBLE,
        defaultValue: 0.0
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'open'
      },
      pictureId: { type: Sequelize.INTEGER },
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
