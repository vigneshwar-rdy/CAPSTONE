'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("voters", "eid", {
      type: Sequelize.DataTypes.INTEGER,
    });
    await queryInterface.addConstraint("voters", {
      fields: ["eid"],
      type: "foreign key",
      references: {
        table: "Elections",
        field: "id",
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("voters","eid");
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
