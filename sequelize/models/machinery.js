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
    name: DataTypes.STRING,
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
    serialNo: DataTypes.STRING,
    width: DataTypes.DOUBLE,
    weight: DataTypes.DOUBLE,
    height: DataTypes.DOUBLE,
    length: DataTypes.DOUBLE,
    tyreNo: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    loadingCapacity: DataTypes.DOUBLE,
    description: DataTypes.STRING(1000),
    horsePower: DataTypes.DOUBLE,
    pictureId: DataTypes.INTEGER
  }, { sequelize, modelName: 'Machinery' }
  )

  return Machinery
}
