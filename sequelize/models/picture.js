'use strict'
module.exports = (sequelize, DataTypes) => {
  const Picture = sequelize.define('Picture', {
    fileName: DataTypes.STRING,
    filePath: DataTypes.STRING,
    mimeType: DataTypes.STRING,
    fileSize: DataTypes.DOUBLE
  }, {})
  Picture.associate = function (models) {
    // associations can be defined here
    Picture.hasOne(models.User, { foreignKey: 'pictureId', as: 'user' })
    Picture.hasOne(models.Machine, { foreignKey: 'pictureId', as: 'machine' })
    Picture.hasOne(models.Machinery, { foreignKey: 'pictureId', as: 'machinery' })
    Picture.hasOne(models.Job, { foreignKey: 'pictureId', as: 'job' })
  }
  return Picture
}
