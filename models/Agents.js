module.exports = (sequelize, DataTypes) => {
    const Agents = sequelize.define("Agents", {
        id:{
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey:true,
            allowNull: false,
            validate:{
                notEmpty: true
            }
        },
    })
    return Agents
}