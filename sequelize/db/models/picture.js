'use strict'
module.exports = (sequelize, DataTypes) => {
  const Picture = sequelize.define('Picture', {
    fileName: DataTypes.STRING,
    filePath: DataTypes.STRING,
    mimeType: DataTypes.STRING,
    fileSize: DataTypes.FLOAT
    // userId: DataTypes.INTEGER,
    // machineId: DataTypes.INTEGER,
    // machineryId: DataTypes.INTEGER
  }, {})
  Picture.associate = function (models) {
    // associations can be defined here
    Picture.hasOne(models.User, { foreignKey: 'pictureId', as: 'user' })
    Picture.hasOne(models.Machine, { foreignKey: 'pictureId', as: 'machine' })
    Picture.hasOne(models.Machinery, { foreignKey: 'pictureId', as: 'machinery' })
  }
  return Picture
}
