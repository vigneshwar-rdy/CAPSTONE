'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Elections extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Elections.belongsTo(models.Admins,{
        foreignKey:"adminId",
      });
      Elections.hasMany(models.questions,{
        foreignKey:"electionId",
      });
      Elections.hasMany(models.voters,{
        foreignKey:"electionId",
      });
    }
    static addelection({ title, adminId }) {
      return this.create({
        name: title,
        adminId,
      });
    }
    static getelections(adminId) {
      return this.findAll({
        where: {
          adminId,
        },
      }); 
    }
    static remove(id,adminId){
      return this.destroy({
        where:{
          id:id,
        }
      })
    }


  }
  Elections.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Elections',
  });
  return Elections;
};