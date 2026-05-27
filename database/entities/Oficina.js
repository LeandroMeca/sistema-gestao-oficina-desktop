const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Oficina",
  tableName: "oficinas",
  columns: {
    id: { primary: true, type: "int", generated: true },
    nome: { type: "varchar" },
    endereco: { type: "varchar", nullable: true },
    endereco_numero: { type: "varchar", nullable: true },
    bairro: { type: "varchar", nullable: true },
    cidade: { type: "varchar", nullable: true },
    uf: { type: "varchar", nullable: true },
    cep: { type: "varchar", nullable: true },
    telefone: { type: "varchar", nullable: true },
    celular: { type: "varchar", nullable: true },
    email: { type: "varchar", nullable: true },
    site: { type: "varchar", nullable: true },
    especialidades: { type: "varchar", nullable: true },
    observacoes: { type: "text", nullable: true },
  },
});
