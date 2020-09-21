'use strict';
module.exports = (sequelize, DataTypes) => {
  const RequestQueue = sequelize.define('RequestQueue', {
    jobId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    lowbedId: DataTypes.INTEGER,
    price: DataTypes.FLOAT,
    status: DataTypes.STRING
  }, {})
  RequestQueue.associate = function (models) {
    // define association here
    RequestQueue.belongsTo(models.Job, { foreignKey: 'jobId', as:'job'})
    RequestQueue.belongsTo(models.User, { foreignKey: 'userId', as: 'user'})
    RequestQueue.belongsTo(models.Machinery, { foreignKey: 'lowbedId', as: 'lowbed'})
  }
  return RequestQueue;
};