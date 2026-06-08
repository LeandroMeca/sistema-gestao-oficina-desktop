Por que o Tailwind não estava funcionando

Resumo: O projeto tinha `tailwind.config.js` dentro de `src/` mas o PostCSS (rodando no contexto do projeto raiz `frontend`) procura o arquivo na raiz do projeto. Para garantir que o Tailwind seja carregado pelo PostCSS/Angular, adicionamos um `tailwind.config.js` na raiz de `frontend` que aponta para os arquivos em `src/`.

O que foi feito:
- Adicionado `tailwind.config.js` na raiz de `frontend` com `content: ['./src/**/*.{html,ts}']`.

Verificação rápida (Windows PowerShell):
```powershell
cd mecanica-parente-electron/frontend
npm install
npm run start
```

Notas:
- Se você tiver um arquivo `tailwind.config.js` personalizado dentro de `src/` com configurações extras, mova ou mescle essas configurações para o novo arquivo na raiz.
- Caso use cache do Angular/ESBuild, reinicie o servidor (`Ctrl+C` e `npm run start`).
