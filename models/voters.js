'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class voters extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      voters.belongsTo(models.Elections,{
        foreignKey:"electionId",
      });
    }
  }
  voters.init({
    vid: DataTypes.STRING,
    password: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'voters',
  });
  return voters;
};