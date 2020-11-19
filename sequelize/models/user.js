'use strict'
const { v4: uuidv4 } = require('uuid')
const { hashSync, genSaltSync } = require('bcrypt')

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: 'User'
    },
    addressId: DataTypes.INTEGER,
    pictureId: DataTypes.INTEGER,
    isActivated: DataTypes.BOOLEAN,
    isApproved: DataTypes.BOOLEAN,
    activationKey: DataTypes.STRING,
    deleted: DataTypes.BOOLEAN,
    spam: DataTypes.BOOLEAN
  }, {
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
    }
  })
  User.associate = function (models) {
    // associations can be defined here
    User.belongsTo(models.Address, { foreignKey: 'addressId', as: 'address' })
    User.belongsTo(models.Picture, { foreignKey: 'pictureId', as: 'picture' })
  }
  return User
}