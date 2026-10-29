# NoteKeeper

[![.NET 10](https://img.shields.io/badge/.NET-10-512BD4?logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![Angular 22](https://img.shields.io/badge/Angular-22-DD0031?logo=angular&logoColor=white)](https://angular.dev/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![SQL Server](https://img.shields.io/badge/SQL_Server-CC2927?logo=microsoftsqlserver&logoColor=white)](https://www.microsoft.com/sql-server)
[![Entity Framework Core](https://img.shields.io/badge/Entity_Framework_Core-512BD4?logo=dotnet&logoColor=white)](https://learn.microsoft.com/ef/core/)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-85EA2D?logo=swagger&logoColor=black)](https://www.openapis.org/)
[![Lucide](https://img.shields.io/badge/Lucide-F56565?logo=lucide&logoColor=white)](https://lucide.dev/)

## 📌 Apresentação

O **NoteKeeper** é uma aplicação web de anotações desenvolvida como projeto de portfólio. Ela permite que cada usuário registre notas, organize-as por categorias e encontre informações por meio de filtros e busca.

A solução é composta por um front-end Angular e uma API ASP.NET Core, com persistência em SQL Server.

## ✨ Funcionalidades

- Cadastro, login e gerenciamento de sessão por token JWT.
- Cadastro, consulta, edição e exclusão de notas.
- Cadastro, consulta, edição e exclusão de categorias.
- Associação opcional de notas com categorias.
- Filtro de notas por categorias e busca local por título ou descrição.
- Exibição das datas de criação e atualização das notas.
- Isolamento de notas e categorias por usuário autenticado.

## 📋 Requisitos funcionais e regras de negócio

### Autenticação e sessão

**Requisitos funcionais**

- Criar uma conta com nome, e-mail e senha.
- Autenticar com e-mail e senha.
- Manter a sessão no navegador e permitir sair da aplicação.
- Disponibilizar dados do usuário atual pela API.

**Regras**

- Nome e e-mail são obrigatórios; o e-mail deve ser válido e único.
- A senha deve conter pelo menos 8 caracteres, um número e um caractere especial.
- Cinco tentativas inválidas consecutivas de login podem provocar um bloqueio temporário de cinco minutos.
- O login emite um JWT com validade configurada em 60 minutos por padrão.
- O cliente persiste os dados da sessão em `localStorage` e envia o token no cabeçalho `Bearer` das requisições HTTP. Ao carregar a sessão, verifica os dados esperados e descarta sessões com token expirado. A API valida o JWT em cada requisição.
- A ação “Sair” do front-end remove a sessão local e direciona para o login. Ela não chama o endpoint de logout da API.
- A API disponibiliza `POST /auth/logout` para revogar o token atual. Depois que a revogação é persistida, as requisições seguintes com esse token são recusadas, sem esperar sua expiração natural; o registro de revogação é mantido até a expiração do token. A autorização exige autenticação por padrão; cadastro e login são públicos.
- As operações de notas e categorias usam a identidade do usuário autenticado para limitar o acesso aos próprios dados.

### Categorias

**Requisitos funcionais**

- Cadastrar, listar, consultar, editar e excluir categorias.

**Regras**

- O título deve conter entre 2 e 100 caracteres.
- O título é removido de espaços nas extremidades e normalizado para comparação. Não podem existir títulos iguais para o mesmo usuário, desconsiderando maiúsculas e minúsculas.
- Uma nota só pode ser associada a categorias pertencentes ao mesmo usuário.
- Ao excluir uma categoria, suas associações com notas são removidas; as notas permanecem.

### Notas

**Requisitos funcionais**

- Cadastrar, listar, consultar, editar e excluir notas.
- Associar uma nota a nenhuma, uma ou várias categorias.
- Filtrar a listagem por categorias e buscar por título ou descrição.

**Regras**

- O título deve conter entre 2 e 100 caracteres e é único por usuário, desconsiderando espaços nas extremidades e diferenças entre maiúsculas e minúsculas.
- A descrição é opcional e limitada a 300 caracteres.
- Os status implementados são `Ativa` e `Arquivada`; notas novas começam como `Ativa`.
- A atualização substitui as categorias associadas à nota. Enviar `categoriaIds` como lista vazia, omitir o parâmetro ou enviá-lo como `null` remove todas as associações.
- Ao filtrar por várias categorias, a API retorna notas associadas a todas as categorias selecionadas.
- A busca por título e descrição é feita no cliente sobre as notas já carregadas e não diferencia maiúsculas de minúsculas. Ela pode ser usada junto do filtro por categorias.

## 🧰 Tecnologias utilizadas

### Front-end

- Angular 22 e TypeScript.
- RxJS e Angular Router.
- Tailwind CSS 4.
- Lucide para ícones.

### Back-end

- .NET 10 e ASP.NET Core.
- ASP.NET Core Identity e autenticação JWT Bearer.
- Entity Framework Core 10 e SQL Server.
- MediatR para requests e handlers.
- FluentResults para resultados e erros.
- OpenAPI e Swagger UI.

### Testes automatizados

- xUnit e Moq nos projetos de teste do back-end.

## 🗂️ Organização das pastas

```text
client/
└── src/
    ├── app/
    │   ├── auth/          # Cadastro, login, sessão e interceptor HTTP
    │   ├── categorias/    # Telas, modelos e serviço de categorias
    │   ├── home/          # Página inicial pública
    │   ├── notas/         # Telas, modelos e serviço de notas
    │   └── shared/        # Componentes compartilhados, como a navbar
    └── environments/      # Configuração da URL da API

server/
├── src/
│   ├── Api/               # API HTTP, controllers e configuração
│   ├── Aplicacao/         # Casos de uso, requests e handlers
│   ├── Dominio/           # Entidades, regras e interfaces
│   └── Infraestrutura/    # Entity Framework, SQL Server e repositórios
├── tests/
│   └── NoteKeeper.Tests/  # Testes de handlers e entidades
├── NoteKeeper.slnx
└── dotnet-tools.json      # Ferramenta local dotnet-ef
```

## 🧭 Páginas e rotas do front-end

As rotas são configuradas em `client/src/app/app.config.ts`.

| Rota | Página |
| --- | --- |
| `/` | Página inicial; o conteúdo varia conforme a sessão |
| `/auth/cadastro` | Cadastro de usuário |
| `/auth/login` | Login |
| `/categorias` e `/categorias/listar` | Lista de categorias |
| `/categorias/cadastrar` | Cadastro de categoria |
| `/categorias/detalhes/:categoriaId` | Detalhes da categoria |
| `/categorias/editar/:categoriaId` | Edição da categoria |
| `/notas` e `/notas/listar` | Lista de notas |
| `/notas/cadastrar` | Cadastro de nota |
| `/notas/detalhes/:notaId` | Detalhes da nota |
| `/notas/editar/:notaId` | Edição da nota |

## 🔌 Endpoints da API

Os endpoints da API são protegidos por autenticação, exceto cadastro e login. Os endpoints de documentação OpenAPI são públicos.

| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| `POST` | `/auth/cadastro` | Público | Cadastra um usuário |
| `POST` | `/auth/login` | Público | Autentica e retorna um JWT |
| `GET` | `/auth/me` | Autenticado | Obtém os dados do usuário atual |
| `POST` | `/auth/logout` | Autenticado | Revoga o JWT atual; requisições seguintes são recusadas e o registro de revogação é mantido até a expiração do token |
| `GET`, `POST` | `/categorias` | Autenticado | Lista ou cria categorias |
| `GET`, `PUT`, `DELETE` | `/categorias/{id}` | Autenticado | Consulta, edita ou exclui uma categoria |
| `GET`, `POST` | `/notas` | Autenticado | Lista ou cria notas |
| `GET`, `PUT`, `DELETE` | `/notas/{id}` | Autenticado | Consulta, edita ou exclui uma nota |

O filtro de notas aceita vários `categoriaIds` na query string. Exemplo para consultar notas que estejam associadas às duas categorias:

```http
GET /notas?categoriaIds=<id-da-categoria-1>&categoriaIds=<id-da-categoria-2>
```

Sem `categoriaIds`, a API retorna todas as notas do usuário autenticado. Erros de aplicação e exceções tratadas explicitamente são retornados como `ProblemDetails`; erros de validação podem incluir mensagens por campo.

## ⚙️ Requisitos para execução local

- .NET SDK 10.
- Node.js `22.22.3` ou `24.15.0` e npm `11.19.0`, conforme as versões compatíveis declaradas pela configuração atual. Outras versões não foram verificadas nesta auditoria.
- SQL Server acessível pela connection string configurada.

## 🚀 Configuração e execução local

### 1. Configure os segredos da API

A API usa a connection string `ConnectionStrings:SqlServer` e as configurações `Jwt:Issuer`, `Jwt:Audience` e `Jwt:SigningKey`. A chave JWT deve ter pelo menos 32 bytes. Os valores de `Issuer`, `Audience` e a expiração padrão estão em `server/src/Api/appsettings.json`; a configuração local da API define a conexão e a origem CORS de desenvolvimento.

O projeto API define `UserSecretsId`. A partir da raiz do repositório, configure localmente a connection string e uma chave privada, substituindo os placeholders:

```bash
dotnet user-secrets set "ConnectionStrings:SqlServer" "<sua-connection-string-do-sql-server>" --project server/src/Api/NoteKeeper.Api.csproj
dotnet user-secrets set "Jwt:SigningKey" "<chave-aleatoria-com-pelo-menos-32-bytes>" --project server/src/Api/NoteKeeper.Api.csproj
```

Não salve chaves ou credenciais no repositório.

O código também lê `LuckyPenny:LicenseKey` da configuração e o atribui à configuração do MediatR. A aplicação não valida essa chave como obrigatória; consulte os termos atuais do MediatR para determinar se ela é necessária para o seu contexto de uso. Se aplicável, configure-a localmente, sem incluí-la no README ou no controle de versão.

### 2. Inicie a API

Na raiz do repositório:

```bash
dotnet run --project server/src/Api/NoteKeeper.Api.csproj
```

O perfil de desenvolvimento configura a API em `http://localhost:5146`. Em ambiente `Development`, a aplicação aplica as migrations automaticamente quando está usando SQL Server. A API permite a origem de desenvolvimento do cliente `http://localhost:4200`.

### 3. Inicie o front-end

Em outro terminal:

```bash
cd client
npm install
npm start
```

O front-end usa `http://localhost:5146` como URL local da API em `client/src/environments/environment.development.ts`. O Angular CLI serve a aplicação na porta padrão `4200`.

## 🧪 Comandos de build e testes

Comandos definidos para a solução .NET, executados a partir da raiz:

```bash
dotnet build server/NoteKeeper.slnx --configuration Release
dotnet test server/NoteKeeper.slnx
```

O front-end define estes scripts em `client/package.json`:

```bash
npm run build
npm test
```

O projeto Angular não declara um target de testes no `client/angular.json`; por isso, o script `npm test` existente não está configurado como uma execução de testes Angular no estado atual. Os testes encontrados no repositório estão em `server/tests/NoteKeeper.Tests`.

## 🧑‍💻 Documentação da API

Com a API em execução, a interface Swagger está disponível em `/swagger` e o documento OpenAPI em `/openapi/v1.json`. Exemplos de requisições estão em `server/src/Api/NoteKeeper.Api.http`.

O repositório fixa `dotnet-ef` em `server/dotnet-tools.json`. Para restaurar a ferramenta local, execute da raiz:

```bash
dotnet tool restore --tool-manifest server/dotnet-tools.json
```

## 👩‍💻 Autoria

**Júlia Hartmann** — [@JuliaaHartmann](https://github.com/JuliaaHartmann)
