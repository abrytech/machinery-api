'use strict'
module.exports = (sequelize, DataTypes) => {
  const RequestQueue = sequelize.define('RequestQueue', {
    jobId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    lowbedId: DataTypes.INTEGER,
    status: {
      type: DataTypes.STRING,
      validate: {
        isIn: [['pending', 'accepted', 'canceled']]
      }
    }
  }, {})
  RequestQueue.associate = function (models) {
    // define association here
    RequestQueue.belongsTo(models.Job, { foreignKey: 'jobId', as: 'job' })
    RequestQueue.belongsTo(models.User, { foreignKey: 'userId', as: 'user' })
    RequestQueue.belongsTo(models.Machinery, { foreignKey: 'lowbedId', as: 'lowbed' })
  }
  return RequestQueue
}
