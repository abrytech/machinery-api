'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class PriceRate extends Model {
    static associate (models) {
      // define association here
      PriceRate.hasOne(models.PriceBook, { foreignKey: 'priceRateId', as: 'pricebook' })
    }
  };
  PriceRate.init({
    name: DataTypes.STRING,
    discoutBy: DataTypes.STRING,
    discountAmount: DataTypes.DOUBLE,
    isDefault: DataTypes.BOOLEAN,
    weightPrice: DataTypes.DOUBLE,
    onRoadPrice: DataTypes.DOUBLE,
    offRoadPrice: DataTypes.DOUBLE
  }, {
    sequelize,
    modelName: 'PriceRate'
  })
  return PriceRate
}
