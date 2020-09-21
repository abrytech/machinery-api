'use strict';
module.exports = (sequelize, DataTypes) => {
  const Job = sequelize.define('Job', {
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    pickUpDate: DataTypes.DATE,
    dropOffpDate: DataTypes.DATE,
    pickUpAddress: DataTypes.INTEGER,
    dropOffAddress: DataTypes.INTEGER,
    machineId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    weight: DataTypes.FLOAT,
    length: DataTypes.FLOAT,
    width: DataTypes.FLOAT,
    height: DataTypes.FLOAT,
    quantity: DataTypes.INTEGER,
    distance: DataTypes.FLOAT,
    offRoadDistance: DataTypes.FLOAT,
    hasOffroad: DataTypes.BOOLEAN,
    status: DataTypes.STRING
  }, {})
  Job.associate = function(models) {
    // define association here
    Job.belongsTo(models.User, {foreignKey: 'userId', as: 'user'})
    Job.belongsTo(models.Machine, {foreignKey: 'machineId', as: 'machine'})
    Job.hasMany(models.RequestQueue, {foreignKey: 'jobId', as: 'requests'})
  }
  return Job;
};