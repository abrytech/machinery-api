'use strict'
module.exports = (sequelize, DataTypes) => {
  const Machine = sequelize.define('Machine', {
    name: DataTypes.STRING,
    description: DataTypes.STRING(500),
    parentId: DataTypes.INTEGER,
    isLowbed: DataTypes.BOOLEAN,
    pictureId: DataTypes.INTEGER
  }, {})
  Machine.associate = function (models) {
    // associations can be defined here
    Machine.hasOne(Machine, { foreignKey: 'parentId', as: 'parent' })
    Machine.belongsTo(models.Picture, { foreignKey: 'pictureId', as: 'picture' })
    Machine.hasMany(models.Machinery, { foreignKey: 'machineId', as: 'machinery' })
  }
  return Machine
}
