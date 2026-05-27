const { DataSource } = require("typeorm");
const { app } = require("electron"); // <-- PRECISAMOS DO APP DO ELECTRON AQUI
const path = require("path");

// Deteta se é o .exe final ou se estamos a programar
const dbPath = app.isPackaged
  ? path.join(app.getPath("userData"), "mecanica.db") // Pasta segura do Windows (AppData)
  : "database/mecanica.db"; // Pasta local para testes

const AppDataSource = new DataSource({
  type: "sqlite",
  database: dbPath, // <-- USA A VARIÁVEL DINÂMICA
  synchronize: true, // Garante que as tabelas são criadas automaticamente num PC novo
  logging: false,
  entities: [
    // ... mantenha as suas entidades exatamente como já estão aqui ...
    require("./entities/Cliente"),
    require("./entities/Veiculo"),
    require("./entities/Funcionario"),
    require("./entities/Produto"),
    require("./entities/Servico"),
  ],
});

module.exports = { AppDataSource };
