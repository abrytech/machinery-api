'use strict'
const { v4: uuidv4 } = require('uuid')
const { hashSync, genSaltSync } = require('bcrypt')
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate (models) {
      // define association here
      User.belongsTo(models.Address, { foreignKey: 'addressId', as: 'address' })
      User.belongsTo(models.Picture, { foreignKey: 'pictureId', as: 'picture' })
      User.hasOne(models.Payment, { foreignKey: 'userId', as: 'payment' })
    }
  };
  User.init({
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    phone: DataTypes.STRING,
    userType: {
      type: DataTypes.STRING,
      defaultValue: 'Lowbed Owner',
      validate: {
        isIn: [['Machinery Owner', 'Lowbed Owner', 'Admin']]
      }
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: 'User',
      validate: {
        isIn: [['User', 'Admin']]
      }
    },
    addressId: DataTypes.INTEGER,
    pictureId: DataTypes.INTEGER,
    isActivated: DataTypes.BOOLEAN,
    isApproved: DataTypes.BOOLEAN,
    activationKey: DataTypes.STRING,
    deleted: DataTypes.BOOLEAN,
    spam: DataTypes.BOOLEAN
  },
  {
    hooks: {
      beforeCreate: (user, option) => {
        user.activationKey = uuidv4()
        if (user.password) {
          user.password = hashSync(user.password, genSaltSync(8), null)
        }
      },
      beforeUpdate: (user, options) => {
        if (user.password) {
          user.password = hashSync(user.password, genSaltSync(8), null)
        }
      }
    },
    sequelize,
    modelName: 'User'
  })
  return User
}
