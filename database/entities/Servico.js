const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Servico",
  tableName: "servicos",
  columns: {
    id: { primary: true, type: "int", generated: true },
    codigo: { type: "varchar", nullable: true }, // Opcional, para códigos internos da oficina
    nome: { type: "varchar" },
    preco: { type: "varchar", nullable: true },
    retornoKm: { type: "varchar", nullable: true }, // Possível retorno em Km
  },
});
