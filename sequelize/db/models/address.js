'use strict';
module.exports = (sequelize, DataTypes) => {
  const Address = sequelize.define('Address', {
    kebele: DataTypes.STRING,
    woreda: DataTypes.STRING,
    zone: DataTypes.STRING,
    city: DataTypes.STRING,
    userId: DataTypes.STRING,
    company:{ 
      type: DataTypes.STRING,
      unique: true,
    },
    phone: { 
      type: DataTypes.STRING,
      unique: true,
    }
  }, {});
  Address.associate = function(models) {
    // associations can be defined here
    Address.belongsTo(models.User, {foreignKey: 'userId', as:'user'})
  };
  return Address;
};