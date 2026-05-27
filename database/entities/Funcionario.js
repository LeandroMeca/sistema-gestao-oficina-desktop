const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Funcionario",
  tableName: "funcionarios",
  columns: {
    id: { primary: true, type: "int", generated: true },
    nome: { type: "varchar" },
    cargo: { type: "varchar", nullable: true },
    status: { type: "varchar", default: "ATIVO" }, // Começa sempre como ATIVO
  },
});
