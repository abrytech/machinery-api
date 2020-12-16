'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Machinery extends Model {
    static associate (models) {
      // associations can be defined here
      Machinery.belongsTo(models.User, { foreignKey: 'userId', sourceKey: 'id', as: 'user' })
      Machinery.belongsTo(models.Picture, { foreignKey: 'pictureId', sourceKey: 'id', as: 'picture' })
      Machinery.belongsTo(models.Machine, { foreignKey: 'machineId', sourceKey: 'id', as: 'machine' })
    }
  };
  Machinery.init({
    machineId: DataTypes.INTEGER,
    madeIn: DataTypes.STRING,
    manufacturingYear: DataTypes.INTEGER,
    licensePlate: {
      type: DataTypes.STRING,
      validate: {
        len: [5, 7]
      }
    },
    motorNo: DataTypes.STRING,
    chassieNo: DataTypes.STRING,
    modelNo: DataTypes.STRING,
    width: DataTypes.FLOAT,
    height: DataTypes.FLOAT,
    length: DataTypes.FLOAT,
    tyreNo: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    loadingCapacity: DataTypes.FLOAT,
    withJackHammer: DataTypes.BOOLEAN,
    serialNo: DataTypes.STRING,
    horsePower: DataTypes.FLOAT,
    pictureId: DataTypes.INTEGER
  }, { sequelize, modelName: 'Machinery' }
  )

  return Machinery
}
