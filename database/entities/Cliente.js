const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Cliente", // Nome da entidade
  tableName: "clientes", // Nome da tabela no banco
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true, // Auto incremento
    },
    nome: {
      type: "varchar",
    },
    cpf: {
      type: "varchar",
      nullable: true,
    },
    rg: {
      type: "varchar",
      nullable: true,
    },
    nascimento: {
      type: "varchar",
      nullable: true,
    },
    telefone: {
      type: "varchar",
      nullable: true,
    },
    celular: {
      type: "varchar",
      nullable: true, // Este é o campo que faltava para a Avaliação!
    },
    endereco: {
      type: "varchar",
      nullable: true,
    },
    bairro: {
      type: "varchar",
      nullable: true,
    },
    cidade: {
      type: "varchar",
      nullable: true,
    },
    uf: {
      type: "varchar",
      nullable: true,
    },
  },
  relations: {
    // Aqui no futuro vamos ligar os Veículos e Ordens de Serviço!
  },
});
