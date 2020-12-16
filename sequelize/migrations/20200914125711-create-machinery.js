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
        type: Sequelize.INTEGER,
        allowNull: false
      },
      madeIn: {
        type: Sequelize.STRING
      },
      manufacturingYear: {
        type: Sequelize.INTEGER
      },
      licensePlate: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      motorNo: {
        type: Sequelize.STRING,
        unique: true
      },
      chassieNo: {
        type: Sequelize.STRING,
        unique: true
      },
      modelNo: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      width: {
        type: Sequelize.FLOAT
      },
      height: {
        type: Sequelize.FLOAT
      },
      length: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      tyreNo: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      userId: {
        type: Sequelize.INTEGER
      },
      loadingCapacity: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      withJackHammer: {
        type: Sequelize.BOOLEAN
      },
      serialNo: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      horsePower: {
        type: Sequelize.FLOAT,
        allowNull: false
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
    return queryInterface.dropTable('Machinery')
  }
}
