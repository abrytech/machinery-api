'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class PriceBook extends Model {
    static associate (models) {
      // define association here
      PriceBook.belongsTo(models.Job, { foreignKey: 'jobId', as: 'job' })
      PriceBook.belongsTo(models.PriceRate, { foreignKey: 'priceRateId', as: 'pricerate' })
    }
  };
  PriceBook.init({
    jobId: DataTypes.INTEGER,
    priceRateId: DataTypes.INTEGER,
    estimatedPrice: DataTypes.DOUBLE,
    actualPrice: DataTypes.DOUBLE
  }, {
    sequelize,
    modelName: 'PriceBook'
  })
  return PriceBook
}
