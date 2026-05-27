const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Veiculo",
  tableName: "veiculos",
  columns: {
    id: { primary: true, type: "int", generated: true },
    cliente_id: { type: "int" }, // Guarda a quem o carro pertence
    modelo: { type: "varchar" },
    marca: { type: "varchar", nullable: true },
    placa: { type: "varchar" },
    cor: { type: "varchar", nullable: true }, // <-- ADICIONADO: Gaveta da Cor
    ano: { type: "varchar", nullable: true }, // <-- ADICIONADO: Gaveta do Ano
  },
  relations: {
    cliente: {
      target: "Cliente",
      type: "many-to-one",
      joinColumn: { name: "cliente_id" },
      onDelete: "CASCADE", // Se apagar o cliente, apaga os carros dele
    },
  },
});
