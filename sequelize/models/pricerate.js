'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class PriceRate extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      PriceRate.hasOne(models.PriceBook, { foreignKey: 'priceRateId', as: 'pricebook' })
    }
  };
  PriceRate.init({
    name: DataTypes.STRING,
    discoutBy: DataTypes.STRING,
    discountAmount: DataTypes.DOUBLE,
    weightPrice: DataTypes.DOUBLE,
    onRoadPrice: DataTypes.DOUBLE,
    offRoadPrice: DataTypes.DOUBLE
  }, {
    sequelize,
    modelName: 'PriceRate'
  })
  return PriceRate
}
