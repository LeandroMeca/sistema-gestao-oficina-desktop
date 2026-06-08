```markdown
# Frontend

Este projeto foi gerado usando o Angular CLI (versão 21.1.3).

## Servidor de desenvolvimento

Para iniciar um servidor de desenvolvimento local, você pode executar:

```bash
ng serve
```

Ou, se preferir usar as tasks disponíveis no workspace (recomendado no VS Code), use a task "npm: start" que roda o script "start" do `package.json`.

Depois que o servidor estiver em execução, abra o navegador em `http://localhost:4200/`. A aplicação será recarregada automaticamente sempre que você modificar os arquivos de origem.

## Gerar código (scaffolding)

O Angular CLI fornece comandos para gerar componentes, diretivas, services, etc. Exemplo para criar um componente:

```bash
ng generate component nome-do-componente
```

Para ver todas as opções de geração e schematics disponíveis:

```bash
ng generate --help
```

## Build (compilação)

Para gerar uma versão de produção do projeto:

```bash
ng build --configuration production
```

Os artefatos de build serão colocados na pasta `dist/`. A build de produção aplica otimizações para melhorar desempenho e tamanho.

## Executar testes unitários

Para executar testes unitários (Vitest configurado no projeto), rode:

```bash
npm test
```

Ou use a task "npm: test" no VS Code.

## Testes end-to-end (E2E)

Se você quiser rodar testes end-to-end, configure um framework de E2E (por exemplo Playwright ou Protractor) e execute o comando correspondente, por exemplo:

```bash
ng e2e
```

O Angular CLI não traz um framework E2E por padrão — escolha o que preferir e siga a documentação do framework escolhido.

## Observações sobre Tailwind

Este projeto inclui Tailwind CSS. Se fizer alterações nas configurações do Tailwind (`tailwind.config.js`), pode ser necessário reiniciar o servidor de desenvolvimento para que as mudanças sejam aplicadas.

## Recursos adicionais

Para mais informações sobre o Angular CLI e seus comandos, consulte a documentação oficial:

[Angular CLI — Overview and Command Reference](https://angular.dev/tools/cli)

```
