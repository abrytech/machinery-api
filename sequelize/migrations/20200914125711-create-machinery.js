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
      name: { type: Sequelize.STRING },
      machineId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      madeIn: { type: Sequelize.STRING },
      manufacturingYear: { type: Sequelize.INTEGER },
      licensePlate: {
        type: Sequelize.STRING,
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
      serialNo: {
        type: Sequelize.STRING,
        unique: true
      },
      modelNo: { type: Sequelize.STRING },
      width: { type: Sequelize.DOUBLE },
      weight: { type: Sequelize.DOUBLE },
      height: { type: Sequelize.DOUBLE },
      length: { type: Sequelize.DOUBLE },
      tyreNo: { type: Sequelize.INTEGER },
      userId: { type: Sequelize.INTEGER },
      isLowbed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      loadingCapacity: { type: Sequelize.DOUBLE },
      description: { type: Sequelize.STRING(1000) },
      horsePower: { type: Sequelize.DOUBLE },
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
