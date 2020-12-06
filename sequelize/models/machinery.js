'use strict'
module.exports = (sequelize, DataTypes) => {
  const Machinery = sequelize.define('Machinery', {
    machineId: DataTypes.INTEGER,
    madeIn: DataTypes.STRING,
    manufacturingYear: DataTypes.INTEGER,
    licensePlate: DataTypes.STRING,
    motorNo: DataTypes.STRING,
    chassieNo: DataTypes.STRING,
    modelNo: DataTypes.STRING,
    width: DataTypes.FLOAT,
    height: DataTypes.FLOAT,
    length: DataTypes.FLOAT,
    weight: DataTypes.FLOAT,
    tyreNo: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    loadingCapacity: DataTypes.FLOAT,
    withJackHammer: DataTypes.BOOLEAN,
    serialNo: DataTypes.STRING,
    horsePower: DataTypes.FLOAT,
    pictureId: DataTypes.INTEGER
  }, {})
  Machinery.associate = function (models) {
    // associations can be defined here
    Machinery.belongsTo(models.User, { foreignKey: 'userId', sourceKey: 'id', as: 'user' })
    Machinery.belongsTo(models.Picture, { foreignKey: 'pictureId', sourceKey: 'id', as: 'picture' })
    Machinery.belongsTo(models.Machine, { foreignKey: 'machineId', sourceKey: 'id', as: 'machine' })
  }
  return Machinery
}
