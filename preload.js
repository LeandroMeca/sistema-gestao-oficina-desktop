const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  //documentos
  salvarPDF: (dados) => ipcRenderer.invoke("salvar-pdf", dados),
  printPDF: (options) => ipcRenderer.invoke("print-pdf", options),

  // clientes
  salvarCliente: (cliente) => ipcRenderer.invoke("salvar-cliente", cliente),
  listarClientes: () => ipcRenderer.invoke("listar-clientes"),
  excluirCliente: (id) => ipcRenderer.invoke("excluir-cliente", id),

  //veiculos
  salvarVeiculo: (veiculo) => ipcRenderer.invoke("salvar-veiculo", veiculo),
  listarVeiculos: (clienteId) =>
    ipcRenderer.invoke("listar-veiculos", clienteId),
  excluirVeiculo: (id) => ipcRenderer.invoke("excluir-veiculo", id),

  // funcionarios
  salvarFuncionario: (funcionario) =>
    ipcRenderer.invoke("salvar-funcionario", funcionario),
  listarFuncionarios: () => ipcRenderer.invoke("listar-funcionarios"),
  excluirFuncionario: (id) => ipcRenderer.invoke("excluir-funcionario", id),

  // oficinas
  salvarOficina: (oficina) => ipcRenderer.invoke("salvar-oficina", oficina),
  listarOficinas: () => ipcRenderer.invoke("listar-oficinas"),

  //produtos
  salvarProduto: (produto) => ipcRenderer.invoke("salvar-produto", produto),
  listarProdutos: () => ipcRenderer.invoke("listar-produtos"),
  excluirProduto: (id) => ipcRenderer.invoke("excluir-produto", id),

  // serviços
  salvarServico: (servico) => ipcRenderer.invoke("salvar-servico", servico),
  listarServicos: () => ipcRenderer.invoke("listar-servicos"),
  excluirServico: (id) => ipcRenderer.invoke("excluir-servico", id),

  // buscar cliente e placa
  buscarClientePorNome: (nome) =>
    ipcRenderer.invoke("buscar-cliente-por-nome", nome),
  buscarVeiculoPorPlaca: (placa) =>
    ipcRenderer.invoke("buscar-veiculo-por-placa", placa),
});
