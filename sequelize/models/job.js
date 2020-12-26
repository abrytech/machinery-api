'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Job extends Model {
    static associate (models) {
      // define association here
      Job.belongsTo(models.User, { foreignKey: 'userId', as: 'user' })
      Job.belongsTo(models.Picture, { foreignKey: 'pictureId', as: 'picture' })
      Job.belongsTo(models.Machine, { foreignKey: 'machineId', as: 'machine' })
      Job.hasOne(models.PriceBook, { foreignKey: 'jobId', as: 'pricebook' })
      Job.hasOne(models.Transaction, { foreignKey: 'jobId', as: 'transaction' })
      Job.hasMany(models.RequestQueue, { foreignKey: 'jobId', as: 'requests' })
      Job.belongsTo(models.Address, { foreignKey: 'pickUpId', as: 'pickUpAddress' })
      Job.belongsTo(models.Address, { foreignKey: 'dropOffId', as: 'dropOffAddress' })
    }
  };
  Job.init({
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    machineryId: DataTypes.INTEGER,
    pickUpDate: DataTypes.DATE,
    dropOffpDate: DataTypes.DATE,
    pickUpId: DataTypes.INTEGER,
    dropOffId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    distance: DataTypes.DOUBLE,
    offRoadDistance: DataTypes.DOUBLE,
    status: {
      type: DataTypes.STRING,
      validate: {
        isIn: [['pending', 'open', 'closed']]
      }
    },
    pictureId: DataTypes.INTEGER
  },
  { sequelize, modelName: 'Job' })
  return Job
}
