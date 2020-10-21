'use strict'
module.exports = (sequelize, DataTypes) => {
  const Address = sequelize.define('Address', {
    kebele: DataTypes.STRING,
    woreda: DataTypes.STRING,
    zone: DataTypes.STRING,
    city: DataTypes.STRING,
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
    Address.hasOne(models.User, { foreignKey: 'userId', sourceKey: 'id', as: 'user' })
    Address.hasOne(models.Job, { foreignKey: 'pickUpId', sourceKey: 'id', as: 'pickUpAddress' })
    Address.hasOne(models.Job, { foreignKey: 'dropOffId', sourceKey: 'id', as: 'dropOffAddress' })
  }
  return Address
}
