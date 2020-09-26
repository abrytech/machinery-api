'use strict'
module.exports = (sequelize, DataTypes) => {
  const Picture = sequelize.define('Picture', {
    fileName: DataTypes.STRING,
    filePath: DataTypes.STRING,
    mimeType: DataTypes.STRING,
    fileSize: DataTypes.FLOAT,
    userId: DataTypes.INTEGER,
    machineId: DataTypes.INTEGER,
    machineryId: DataTypes.INTEGER
  }, {})
  Picture.associate = function (models) {
    // associations can be defined here
    Picture.belongsTo(models.User, { foreignKey: 'userId', as: 'user' })
    Picture.belongsTo(models.Machine, { foreignKey: 'machineId', as: 'machine' })
    Picture.belongsTo(models.Machinery, { foreignKey: 'machineryId', as: 'machinery' })
  }
  return Picture
}
