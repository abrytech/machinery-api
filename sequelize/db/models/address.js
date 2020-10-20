'use strict'
module.exports = (sequelize, DataTypes) => {
  const Address = sequelize.define('Address', {
    kebele: DataTypes.STRING,
    woreda: DataTypes.STRING,
    zone: DataTypes.STRING,
    city: DataTypes.STRING,
    lat: DataTypes.FLOAT,
    long: DataTypes.FLOAT,
    jobId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    company: {
      type: DataTypes.STRING,
      unique: true
    },
    phone: {
      type: DataTypes.STRING,
      unique: true
    }
  }, {})
  Address.associate = function (models) {
    // associations can be defined here
    Address.belongsTo(models.User, { foreignKey: 'userId', as: 'user' })
    Address.hasOne(models.Job, { foreignKey: 'jobId', sourceKey: 'dropOffAddress', as: 'dropOffAddress' })
    Address.hasOne(models.Job, { foreignKey: 'jobId', sourceKey: 'pickUpAddress', as: 'pickUpAddress' })
  }
  return Address
}
