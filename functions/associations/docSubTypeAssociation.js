const { DataTypes } = require('sequelize')

const { DocSubType, Documents } = require("../../models")

Documents.hasMany(DocSubType, {
    foriegnKey:{
        type: DataTypes.UUID,
        allowNull:false
    }
});
DocSubType.belongsTo(Documents);

module.exports = { DocSubType, Documents }