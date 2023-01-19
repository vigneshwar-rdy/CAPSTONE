'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("questions", "eid", {
      type: Sequelize.DataTypes.INTEGER,
    });
    await queryInterface.addConstraint("questions", {
      fields: ["eid"],
      type: "foreign key",
      references: {
        table: "Elections",
        field: "id",
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("questions","eid");
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
