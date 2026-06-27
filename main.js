const { app, BrowserWindow, ipcMain, shell } = require("electron");
const fs = require("fs");
const path = require("path");
const { AppDataSource } = require("./database/data-source");

// ======================================================
// ESPERA O ANGULAR (Apenas para Desenvolvimento)
// ======================================================
function waitForServer(url, timeout = 30000, interval = 500) {
  const parsed = new URL(url);
  const client =
    parsed.protocol === "https:" ? require("https") : require("http");

  return new Promise((resolve, reject) => {
    const started = Date.now();
    const tryRequest = () => {
      const req = client.request(
        {
          method: "GET",
          host: parsed.hostname,
          port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
          path: parsed.pathname || "/",
        },
        (res) => {
          res.resume();
          resolve();
        },
      );
      req.on("error", () => {
        if (Date.now() - started > timeout) {
          reject(new Error(`Timeout waiting for ${url}`));
        } else {
          setTimeout(tryRequest, interval);
        }
      });
      req.setTimeout(2000, () => {
        req.destroy();
      });
      req.end();
    };
    tryRequest();
  });
}

// ======================================================
// JANELA PRINCIPAL
// ======================================================
let mainWindow;
const url = require("url");

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (app.isPackaged) {
    // MODO PRODUÇÃO (.exe) - Carrega o index.html de dentro do pacote.
    const indexPath = path.join(__dirname, "frontend-app", "index.html");

    if (fs.existsSync(indexPath)) {
      // Workaround: Lemos o HTML, forçamos o base href para ser relativo ("./")
      // e carregamos o conteúdo. Isso corrige o problema de caminhos de arquivos
      // (ERR_FILE_NOT_FOUND) que ocorre quando o build do Angular define <base href="/">.
      let html = fs.readFileSync(indexPath, "utf-8");
      html = html.replace(/<base\s+href="\/">/, '<base href="./">');
      mainWindow.loadURL(
        `data:text/html;charset=utf-8,${encodeURIComponent(html)}`,
        {
          baseURLForDataURL: `file://${path.join(__dirname, "frontend-app")}/`,
        },
      );
    } else {
      // Este erro agora indica um problema no empacotamento com electron-builder
      const htmlErro = `data:text/html;charset=utf-8,
        <body style="font-family: Arial; padding: 40px;">
          <h1 style="color:red">ERRO: Arquivos do Angular não encontrados no pacote!</h1>
          <p>O electron-builder não copiou os arquivos do frontend para a pasta 'frontend-app'.</p>
          <p style="background:#eee; padding:15px; font-size:16px;">Caminho procurado: <b>${indexPath}</b></p>
        </body>`;
      mainWindow.loadURL(htmlErro);
    }
  } else {
    // MODO DESENVOLVIMENTO
    const appUrl = "http://localhost:4201";
    try {
      await waitForServer(appUrl);
      await mainWindow.loadURL(appUrl);
      mainWindow.webContents.openDevTools();
    } catch (err) {
      console.error("Erro ao abrir Angular:", err);
      await mainWindow.loadURL(appUrl);
    }
  }
}

// ======================================================
// APP READY (LIGA O BANCO DE DADOS)
// ======================================================
app.whenReady().then(async () => {
  try {
    await AppDataSource.initialize();
    console.log("Banco de dados SQLite inicializado com sucesso para o EXE!");
  } catch (error) {
    console.error("Erro ao inicializar o banco de dados:", error);
  }

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// ======================================================
// FECHAR O APP
// ======================================================
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

/**
 * Cria um wrapper para os handlers do ipcMain que centraliza o tratamento de erros
 * e a estrutura da resposta.
 * @param {string} channel O canal IPC para o qual responder.
 * @param {function} handler A função assíncrona que executa a lógica principal.
 */
function handleWithLogging(channel, handler) {
  ipcMain.handle(channel, async (event, ...args) => {
    try {
      // Passa os argumentos para o handler original e retorna o resultado em caso de sucesso
      return await handler(event, ...args);
    } catch (error) {
      console.error(`Erro no canal IPC '${channel}':`, error);
      return { success: false, error: error.message };
    }
  });
}
// ======================================================
// HANDLERS ÚNICOS
// ======================================================

handleWithLogging(
  "salvar-pdf",
  async (event, { buffer, cliente, servico, nomeArquivo }) => {
    const baseDir = path.join(app.getPath("documents"), "Relatorios");
    const clienteLimpo = (cliente || "Cliente")
      .toString()
      .replace(/[\\/:*?"<>|]/g, "");
    const servicoLimpo = (servico || "Servico")
      .toString()
      .replace(/[\\/:*?"<>|]/g, "");
    const finalDir = path.join(baseDir, clienteLimpo, servicoLimpo);

    fs.mkdirSync(finalDir, { recursive: true });
    const filePath = path.join(finalDir, nomeArquivo);

    let raw = buffer;
    if (typeof raw === "string" && raw.startsWith("data:")) {
      raw = raw.split(",")[1];
    }

    const pdfBuffer = Buffer.from(raw, "base64");
    fs.writeFileSync(filePath, pdfBuffer);

    return { success: true, path: filePath };
  },
);

handleWithLogging("print-pdf", async (event, options = {}) => {
  const {
    cliente = "Cliente",
    servico = "servico",
    nomeArquivo = `print-${Date.now()}.pdf`,
    html,
  } = options;

  if (!html) {
    throw new Error("O conteúdo HTML é obrigatório para gerar o PDF.");
  }

  const offscreen = new BrowserWindow({
    width: 800,
    height: 1100,
    show: false,
    webPreferences: { contextIsolation: true, nodeIntegration: false },
  });

  const dataUrl =
    "data:text/html;base64," + Buffer.from(html, "utf8").toString("base64");
  await offscreen.loadURL(dataUrl);

  const pdfBuffer = await offscreen.webContents.printToPDF({
    printBackground: true,
  });

  const baseDir = path.join(app.getPath("documents"), "Relatorios");
  const clienteLimpo = cliente.toString().replace(/[\\/:*?"<>|]/g, "");
  const servicoLimpo = servico.toString().replace(/[\\/:*?"<>|]/g, "");
  const finalDir = path.join(baseDir, clienteLimpo, servicoLimpo);

  fs.mkdirSync(finalDir, { recursive: true });
  const filePath = path.join(finalDir, nomeArquivo);

  fs.writeFileSync(filePath, pdfBuffer);
  offscreen.close();

  return { success: true, path: filePath };
});

// --- CLIENTES ---
handleWithLogging("listar-clientes", async () => {
  const repo = AppDataSource.getRepository("Cliente");
  const clientes = await repo.find();
  return { success: true, clientes };
});

handleWithLogging("salvar-cliente", async (event, dadosCliente) => {
  const repo = AppDataSource.getRepository("Cliente");
  const novoCliente = repo.create(dadosCliente);
  await repo.save(novoCliente);
  return { success: true, cliente: novoCliente };
});

handleWithLogging("excluir-cliente", async (event, id) => {
  const repo = AppDataSource.getRepository("Cliente");
  await repo.delete(id);
  return { success: true };
});

// --- VEÍCULOS ---
handleWithLogging("salvar-veiculo", async (event, dadosVeiculo) => {
  const repo = AppDataSource.getRepository("Veiculo");
  const novoVeiculo = repo.create(dadosVeiculo);
  await repo.save(novoVeiculo);
  return { success: true, veiculo: novoVeiculo };
});

handleWithLogging("listar-veiculos", async (event, clienteId) => {
  const repo = AppDataSource.getRepository("Veiculo");
  const veiculos = await repo.find({ where: { cliente_id: clienteId } });
  return { success: true, veiculos };
});

handleWithLogging("excluir-veiculo", async (event, id) => {
  const repo = AppDataSource.getRepository("Veiculo");
  await repo.delete(id);
  return { success: true };
});

// --- FUNCIONÁRIOS ---
handleWithLogging("salvar-funcionario", async (event, dadosFuncionario) => {
  const repo = AppDataSource.getRepository("Funcionario");
  const novoFuncionario = repo.create(dadosFuncionario);
  await repo.save(novoFuncionario);
  return { success: true, funcionario: novoFuncionario };
});

handleWithLogging("listar-funcionarios", async () => {
  const repo = AppDataSource.getRepository("Funcionario");
  const funcionarios = await repo.find();
  return { success: true, funcionarios };
});

handleWithLogging("excluir-funcionario", async (event, id) => {
  const repo = AppDataSource.getRepository("Funcionario");
  await repo.delete(id);
  return { success: true };
});

// --- PRODUTOS ---
handleWithLogging("salvar-produto", async (event, dadosProduto) => {
  const repo = AppDataSource.getRepository("Produto");
  const novoProduto = repo.create(dadosProduto);
  await repo.save(novoProduto);
  return { success: true, produto: novoProduto };
});

handleWithLogging("listar-produtos", async () => {
  const repo = AppDataSource.getRepository("Produto");
  const produtos = await repo.find();
  return { success: true, produtos };
});

handleWithLogging("excluir-produto", async (event, id) => {
  const repo = AppDataSource.getRepository("Produto");
  await repo.delete(id);
  return { success: true };
});

// --- SERVIÇOS ---
handleWithLogging("salvar-servico", async (event, dadosServico) => {
  const repo = AppDataSource.getRepository("Servico");
  const novoServico = repo.create(dadosServico);
  await repo.save(novoServico);
  return { success: true, servico: novoServico };
});

handleWithLogging("listar-servicos", async () => {
  const repo = AppDataSource.getRepository("Servico");
  const servicos = await repo.find();
  return { success: true, servicos };
});

handleWithLogging("excluir-servico", async (event, id) => {
  const repo = AppDataSource.getRepository("Servico");
  await repo.delete(id);
  return { success: true };
});

// --- BUSCAS DINÂMICAS ---
handleWithLogging("buscar-cliente-por-nome", async (event, nome) => {
  const repo = AppDataSource.getRepository("Cliente");
  const clientes = await repo
    .createQueryBuilder("cliente")
    .where("cliente.nome LIKE :nome", { nome: `%${nome}%` })
    .getMany();
  return { success: true, clientes };
});

handleWithLogging("buscar-veiculo-por-placa", async (event, placa) => {
  const repo = AppDataSource.getRepository("Veiculo");
  const veiculo = await repo.findOne({ where: { placa: placa } });
  return { success: true, veiculo };
});

// --- OFICINA / ESTABELECIMENTO ---
handleWithLogging("salvar-oficina", async (event, dadosOficina) => {
  const repo = AppDataSource.getRepository("Oficina");
  // Se existir id, atualiza; caso contrário cria novo
  if (dadosOficina.id) {
    await repo.update(dadosOficina.id, dadosOficina);
    const oficinaAtualizada = await repo.findOne({
      where: { id: dadosOficina.id },
    });
    return { success: true, oficina: oficinaAtualizada };
  } else {
    const novo = repo.create(dadosOficina);
    await repo.save(novo);
    return { success: true, oficina: novo };
  }
});

handleWithLogging("listar-oficinas", async () => {
  const repo = AppDataSource.getRepository("Oficina");
  const oficinas = await repo.find();
  return { success: true, oficinas };
});

// ==============================================================================
// HANDLERS DE DOCUMENTOS (LER PASTAS E ABRIR PDF)
// ==============================================================================
ipcMain.handle("listar-documentos-cliente", async (event, clienteNome) => {
  try {
    const baseDir = path.join(app.getPath("documents"), "Relatorios");

    // O .trim() remove espaços vazios no final do nome do cliente!
    const clienteLimpo = clienteNome
      .toString()
      .replace(/[\\/:*?"<>|]/g, "")
      .trim();
    const clienteDir = path.join(baseDir, clienteLimpo);

    console.log("🕵️‍♂️ Procurando pasta do cliente em:", clienteDir);

    if (!fs.existsSync(clienteDir)) {
      console.log("❌ Pasta não encontrada no Windows!");
      return { success: true, documentos: [] };
    }

    let documentos = [];
    // Lê as pastas de serviço
    const pastasServicos = fs
      .readdirSync(clienteDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    console.log("📂 Pastas de serviços encontradas:", pastasServicos);

    for (const servico of pastasServicos) {
      const servicoDir = path.join(clienteDir, servico);
      // Pega qualquer variação de .pdf ou .PDF
      const arquivos = fs
        .readdirSync(servicoDir)
        .filter((file) => file.toLowerCase().endsWith(".pdf"));

      for (const arquivo of arquivos) {
        documentos.push({
          servico: servico,
          nomeArquivo: arquivo,
          caminhoCompleto: path.join(servicoDir, arquivo),
        });
      }
    }

    console.log("✅ Total de PDFs encontrados:", documentos.length);
    return { success: true, documentos };
  } catch (error) {
    console.error("❌ Erro ao listar documentos:", error);
    return { success: false, error: error.message };
  }
});

// Handler para abrir o PDF direto no leitor do Windows
ipcMain.handle("abrir-documento", async (event, caminho) => {
  try {
    await shell.openPath(caminho);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
