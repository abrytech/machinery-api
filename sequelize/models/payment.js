'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      Payment.belongsTo(models.User, { foreignKey: 'userId', as: 'user' })
      Payment.hasMany(models.Transaction, { foreignKey: 'paymentId', as: 'transactions' })
    }
  };
  Payment.init({
    balance: DataTypes.DOUBLE,
    lastDeposit: DataTypes.DOUBLE,
    totalDeposit: DataTypes.DOUBLE,
    userId: DataTypes.INTEGER
  }, { sequelize, modelName: 'Payment' })
  return Payment
}
