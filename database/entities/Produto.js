const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Produto",
  tableName: "produtos",
  columns: {
    id: { primary: true, type: "int", generated: true },
    codigo: { type: "varchar", nullable: true }, // Opcional, caso a peça tenha um código de barras/fábrica
    nome: { type: "varchar" },
    fornecedor: { type: "varchar", nullable: true },
    precoCusto: { type: "varchar", nullable: true },
    precoVenda: { type: "varchar", nullable: true },
    fabricante: { type: "varchar", nullable: true },
    garantia: { type: "varchar", nullable: true },
    vidaUtil: { type: "varchar", nullable: true },
  },
});
