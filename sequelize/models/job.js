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
      Job.hasMany(models.RequestQueue, { foreignKey: 'jobId', as: 'requests' })
      Job.belongsTo(models.Address, { foreignKey: 'pickUpId', as: 'pickUpAddress' })
      Job.belongsTo(models.Address, { foreignKey: 'dropOffId', as: 'dropOffAddress' })
    }
  };
  Job.init({
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    pickUpDate: DataTypes.DATE,
    dropOffpDate: DataTypes.DATE,
    pickUpId: DataTypes.INTEGER,
    dropOffId: DataTypes.INTEGER,
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
    status: DataTypes.STRING,
    pictureId: DataTypes.INTEGER
  },
  { sequelize, modelName: 'Job' })
  return Job
}
