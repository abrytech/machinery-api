'use strict'
module.exports = (sequelize, DataTypes) => {
  const Address = sequelize.define('Address', {
    kebele: DataTypes.STRING,
    woreda: DataTypes.STRING,
    city: DataTypes.STRING,
    zone: DataTypes.STRING,
    region: DataTypes.STRING,
    lat: DataTypes.FLOAT,
    long: DataTypes.FLOAT,
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
    // Address.belongsTo(models.User, { foreignKey: 'userId', as: 'user' })
    Address.hasOne(models.User, { foreignKey: 'addressId', as: 'user' })
    Address.hasOne(models.Job, { foreignKey: 'pickUpId', as: 'pickUpAddress' })
    Address.hasOne(models.Job, { foreignKey: 'dropOffId', as: 'dropOffAddress' })
  }
  return Address
}