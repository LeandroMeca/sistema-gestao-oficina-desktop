# Oficina — App de Gestão de Oficina (Electron + Angular + TypeORM)

<p align="center">
  <img src="https://img.shields.io/badge/Electron-191970?style=for-the-badge&logo=Electron&logoColor=white" alt="Electron"/>
  <img src="https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white" alt="Angular"/>
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite"/>
  <img src="https://img.shields.io/badge/TypeORM-FE0803?style=for-the-badge&logo=typeorm&logoColor=white" alt="TypeORM"/>
</p>

Aplicação desktop feita com Electron e frontend em Angular para gerenciar clientes, veículos, funcionários, produtos/serviços e gerar documentos (PDF) como Avaliação Técnica e Orçamentos.

- Projeto completo end-to-end (desktop app) com Electron + Angular.
- Integração local com banco SQLite via TypeORM (EntitySchema JS).
- Geração de PDFs a partir de HTML (automação de documentos empresariais).
- Estrutura modular (páginas, entidades, IPC segura pelo `preload.js`).
- Scripts e pipeline prontos para desenvolvimento e empacotamento (electron-builder).

Tecnologias principais

* **[Electron](https://www.electronjs.org/)** (Desktop Wrapper)
* **[Angular](https://angular.io/)** (Frontend / UI)
* **[Node.js](https://nodejs.org/)** (Host Process / Backend)
* **[SQLite](https://www.sqlite.org/)** + **[TypeORM](https://typeorm.io/)** (Database local via `database/data-source.js`)
* **[SweetAlert2](https://sweetalert2.github.io/)** (UX Reativa para confirmações)

Quick Demo (local)

1. Instalar dependências (na raiz do projeto):

```powershell
cd C:\Users\novo\Documents\angularProject\oficina
npm install
cd mecanica-parente-electron\frontend
npm install
```

2. Rodar em modo desenvolvimento

Abra dois terminais:

Terminal 1 (frontend - Angular dev server):

```powershell
cd mecanica-parente-electron\frontend
npm run start -- --port 4201
```

Terminal 2 (app host - Electron):

```powershell
cd C:\Users\novo\Documents\angularProject\oficina
npm start
```

- A interface do frontend será servida em `http://localhost:4201/` e o Electron carrega essa URL para render.
- A inicialização registra/abre o banco SQLite automaticamente.

Fluxo rápido para testar a nova funcionalidade "Oficina"

- Abra o menu "Oficina" no app.
- Preencha os dados da oficina (nome, endereço, telefones, especialidades) e clique em "Salvar".
- Vá em "Avaliação Técnica", selecione o técnico (campo traz os funcionários do DB), preencha o veículo/cliente e clique em gerar PDF.
- O header do PDF será preenchido com os dados salvos na tela "Oficina".

Arquitetura (visão de alto-nível)

- `main.js` — processo principal do Electron, expõe handlers IPC e realiza operações de arquivo/DB (printPDF, salvar/listar entidades).
- `preload.js` — layer segura com `contextBridge.exposeInMainWorld` para a API usada pelo renderer.
- `mecanica-parente-electron/frontend/src` — código Angular: páginas, rotas e templates.
- `database/` — entidades TypeORM em `database/entities` e `data-source.js` para conexão e sincronização.

Notas de desenvolvimento

- As entidades estão definidas com `EntitySchema` em JS para simplicidade; o TypeORM está configurado para sincronizar o esquema durante o startup (ver `database/data-source.js`).
- Se a tabela não for criada automaticamente, execute o app para que o TypeORM aplique o sync (ou configure migrations).
- Para empacotar o app existem scripts com `electron-builder` (veja `release/` e `package.json` na raiz).

Como contribuir / melhorar

- Adicionar validações mais robustas nos formulários da `Oficina` (ex: CEP, telefone).
- Permitir múltiplas oficinas e selecionar a oficina ativa nas configurações.
- Adicionar testes automatizados (unit + integração para IPC).
- Converter entidades para TypeScript para melhor cobertura de tipos.

Contato

- Projeto mantido localmente. Para dúvidas sobre execução ou para pedir features adicionais, abra uma issue neste repositório (ou envie link e instruções).

---

Versão do projeto: 1.0.1
