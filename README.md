# Social Manager API

Este projeto é uma aplicação Node.js que serve como base para desenvolvimento de aplicações web. Ele inclui uma estrutura básica com componentes reutilizáveis, páginas e funções utilitárias.

 
## Pré-requisitos
Antes de começar, certifique-se de ter as seguintes ferramentas instaladas em sua máquina:
- [Node.js](https://nodejs.org/) (versão 14.x ou superior)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)

## Instalação
Siga os passos abaixo para configurar o projeto localmente:

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/seu-repositorio.git
```

2. Navegue até o diretório do projeto:

```bash
cd 18mc-admin-api
```

3. Instale as dependências: Se estiver usando npm:

```bash
npm install
```
Ou, se estiver usando yarn:
```bash
yarn install
```
Uso:
Para iniciar o projeto em ambiente de desenvolvimento, execute o seguinte comando:
```bash
npm run dev
```

Ou, se estiver usando yarn:
```bash
yarn dev
```

O projeto estará disponível em http://localhost:3000.

**Scripts Disponíveis**

Aqui estão alguns scripts úteis que você pode executar:

    npm run dev ou yarn dev: Inicia o servidor de desenvolvimento.
    
    npm run build ou yarn build: Compila o projeto para produção.
    
    npm run start ou yarn start: Inicia o servidor em modo de produção.
    
    npm run test ou yarn test: Executa os testes.

## Variáveis de Ambiente

Este projeto utiliza `dotenv` para gerenciar variáveis de ambiente. Para configurar as variáveis de ambiente, crie um arquivo `.env` na pasta raiz do projeto com o seguinte conteúdo:

```
JAWSDB_URL=mysql://usuario:senha@localhost:3306/banco_de_dados
JWT_SECRET=sua_chave_secreta_jwt
CORS_ORIGIN=http://localhost:3000
BREVO_API_KEY=sua_chave_api_brevo
FRONTEND_URL=http://localhost:3000
EMAIL_FROM=no-reply@exemplo.com
```

### Instruções

1. Instale o pacote `dotenv` caso ainda não esteja instalado:
   ```bash
   npm install dotenv
   ```

2. Crie um arquivo `.env` na pasta raiz do projeto.

3. Copie as variáveis de exemplo acima para o arquivo `.env` e substitua os valores pelos dados reais da sua configuração.

4. Certifique-se de que o arquivo `.env` não seja enviado para o controle de versão adicionando-o ao arquivo `.gitignore`:
   ```
   .env
   ```

## Migrations

Para aplicar migration no banco de dados, você pode usar o seguinte comando:
```bash
npx sequelize db:migrate
```

Esse comando executa todas as migrations pendentes e aplica as alterações no banco de dados.

Verificar o status: Se você quiser verificar quais migrations já foram aplicadas, pode usar:

```bash
npx sequelize db:migrate:status
```

Reverter uma migration: Se for necessário desfazer a última migration executada, use:
```bash
npx sequelize db:migrate:undo
```

Para desfazer todas as migrations (se precisar recomeçar do zero):
```bash
npx sequelize db:migrate:undo:all
```

**Para aplicar a migration no banco de dados do Heroku, siga estas etapas:**

1. Acesse o Heroku CLI: Se você ainda não estiver autenticado no Heroku CLI, faça login usando:
```bash
heroku login
```

2. Navegue até o aplicativo: Garanta que você está no diretório do projeto ou use o flag --app <app_name> em todos os comandos, substituindo <app_name> pelo nome do seu aplicativo no Heroku.

3. Configure as variáveis de ambiente (opcional): Certifique-se de que o Heroku tem as variáveis de ambiente de configuração do banco de dados definidas corretamente, como DATABASE_URL.

4. Execute as migrations: Use o comando abaixo para rodar as migrations no banco de dados do Heroku:
```bash
heroku run npx sequelize db:migrate --app <app_name>
```

Substitua <app_name> pelo nome do seu aplicativo. Este comando executa as migrations pendentes no banco de dados configurado no Heroku.

**Comandos adicionais**

Desfazer a última migration:

```bash
heroku run npx sequelize db:migrate:undo --app <app_name>
```

Desfazer todas as migrations (caso precise):
```bash
heroku run npx sequelize db:migrate:undo:all --app <app_name>
```

## Swagger

Comando para atualizar o Swagger:
```bash
node swagger.js
```

Licença

Este projeto está licenciado sob a licença MIT. Consulte o arquivo LICENSE para obter mais informações.
