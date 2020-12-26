'use strict'
module.exports = (sequelize, DataTypes) => {
  const Address = sequelize.define('Address', {
    kebele: DataTypes.STRING,
    woreda: DataTypes.STRING,
    city: DataTypes.STRING,
    zone: DataTypes.STRING,
    region: DataTypes.STRING,
    lat: DataTypes.DOUBLE,
    long: DataTypes.DOUBLE,
    company: DataTypes.STRING,
    phone: DataTypes.STRING
  }, {})
  Address.associate = function (models) {
    // associations can be defined here
    // Address.belongsTo(models.User, { foreignKey: 'userId', as: 'user' })
    Address.hasOne(models.User, { foreignKey: 'addressId', as: 'user' })
    Address.hasOne(models.Job, { foreignKey: 'pickUpId', as: 'pickUpJob' })
    Address.hasOne(models.Job, { foreignKey: 'dropOffId', as: 'dropOffJob' })
  }
  return Address
}
