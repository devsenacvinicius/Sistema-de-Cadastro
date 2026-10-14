# Sistema de Cadastro de Usuários

Documentação do projeto, incluindo a versão inicial, as mudanças
realizadas e o funcionamento atual conhecido.

> **Histórico de versões:** este documento separa o que existia antes de
> terça-feira, **13 de outubro de 2026**, das mudanças feitas a partir
> dessa data. Os detalhes refletem as informações registradas durante o
> desenvolvimento; confira os arquivos locais caso tenha feito outras
> alterações fora desta conversa.

## 1. Sobre o projeto

Sistema web para cadastrar, visualizar, alterar e excluir usuários. O
projeto começou como uma aplicação simples em HTML, CSS e JavaScript,
usando o armazenamento do navegador. Depois, foi ampliado para utilizar
uma API em Node.js/Express e um banco de dados SQLite.

## 2. Tecnologias

-   **HTML5:** estrutura das páginas e do formulário.
-   **CSS3:** layout, cores, cartões, campos, tabela e responsividade.
-   **JavaScript:** interação com o formulário e a tabela.
-   **Node.js:** execução do backend.
-   **Express:** servidor HTTP e rotas da API.
-   **SQLite:** persistência dos cadastros.
-   **Letos:** ferramenta gráfica utilizada para abrir e gerenciar o
    banco SQLite.

## 3. Histórico: versão anterior a terça-feira, 13/10/2026

### Versão inicial

A versão inicial era uma aplicação de cadastro no navegador, com os
seguintes recursos:

-   Campos de nome completo, e-mail, senha, confirmação de senha, data
    de nascimento e telefone.
-   Validações de preenchimento e dos dados.
-   Opção de mostrar ou ocultar a senha.
-   Indicador de força da senha.
-   Máscara para o telefone.
-   Aceite dos termos.
-   Mensagens para informar o resultado das ações.
-   Armazenamento dos usuários no `localStorage`, usando a chave
    `usuarios`.
-   Registro de identificador e data de cadastro junto dos dados do
    usuário.

### Simplificação do formulário

Antes de 13/10/2026, o projeto também foi simplificado para uma versão
com:

-   Campo de nome.
-   Campo de e-mail.
-   Campo de número/telefone.
-   Botão **Confirmar cadastro**.
-   Formulário posicionado à esquerda.
-   Tabela de usuários cadastrados à direita.
-   Dados guardados no `localStorage` do navegador.

Nessa etapa, os dados ficavam no navegador e não eram gravados em uma
base SQLite por meio de uma API.

## 4. Mudanças realizadas a partir de 13/10/2026

### 4.1 Backend e banco de dados

O projeto passou a usar Node.js, Express e SQLite para persistir os
cadastros.

Estrutura de pastas registrada durante o desenvolvimento:

``` text
Sistema de Cadastro/
├── index.html
├── script.js
├── style.css
└── backend/
    ├── server.js
    ├── package.json
    └── data/
        ├── Banco_Dados.db
        └── usuarios.db
```

**Observação:** os dois arquivos `.db` foram mencionados durante a
configuração. O servidor deve apontar para o arquivo que realmente está
sendo usado como banco principal. A configuração mais recente discutida
utiliza `backend/data/Banco_Dados.db`.

### 4.2 Estrutura da tabela `usuarios`

A tabela passou a trabalhar com estes campos:

  Campo        Finalidade
  ------------ ------------------------------------------------------------
  `id`         Identificador numérico do usuário, gerado automaticamente.
  `nome`       Nome do usuário.
  `codinome`   Codinome do usuário.
  `email`      E-mail, com restrição de unicidade.
  `nivel`      Nível selecionado pelo usuário.
  `telefone`   Número de telefone.

SQL de referência para a estrutura atual:

``` sql
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    codinome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    nivel TEXT NOT NULL DEFAULT 'Iniciante',
    telefone TEXT NOT NULL
);
```

O servidor também foi preparado para adicionar colunas ausentes em uma
tabela já existente. Se o banco tiver dados antigos, confira a estrutura
no Letos antes de executar alterações manuais.

### 4.3 Níveis disponíveis

As opções do campo **Nível** foram definidas para:

-   Iniciante
-   Especialista
-   Líder

O valor inicial do seletor é uma opção vazia para solicitar que a pessoa
escolha um nível.

### 4.4 API do backend

As rotas discutidas para o backend são:

  Método     Rota              Ação
  ---------- ----------------- ------------------------------------------
  `POST`     `/usuarios`       Cadastrar um usuário.
  `GET`      `/usuarios`       Listar os usuários.
  `GET`      `/usuarios/:id`   Consultar um usuário pelo identificador.
  `PUT`      `/usuarios/:id`   Atualizar os dados de um usuário.
  `DELETE`   `/usuarios/:id`   Excluir um usuário.

A rota `PUT` é necessária para que o botão **Alterar** salve as
modificações no banco.

### 4.5 Integração do frontend com a API

O JavaScript do frontend foi atualizado para usar `fetch()` e a API em
vez de depender apenas do `localStorage`.

O endereço usado no código discutido é:

``` js
const API_URL = 'http://localhost:3000/usuarios';
```

O frontend passou a:

-   Carregar a lista por meio de `GET /usuarios`.
-   Enviar novos cadastros por meio de `POST /usuarios`.
-   Enviar atualizações por meio de `PUT /usuarios/:id`.
-   Solicitar exclusão por meio de `DELETE /usuarios/:id`.
-   Exibir mensagens de sucesso ou erro.
-   Atualizar a tabela depois das operações.
-   Pedir confirmação antes de excluir um usuário.

**Diferença importante:** o `localStorage` guarda dados no navegador. A
API com SQLite envia os dados ao servidor e os grava no arquivo de banco
configurado.

### 4.6 Formulário e tabela

O formulário atual contém:

-   Nome
-   Codinome
-   E-mail
-   Nível
-   Telefone

A tabela exibe:

-   ID
-   Nome
-   Codinome
-   E-mail
-   Nível
-   Telefone
-   Ações

Os campos do HTML precisam usar os mesmos identificadores esperados pelo
`script.js`, especialmente `nome`, `codinome`, `email`, `nivel` e
`numero`. O campo visual de telefone tem o ID `numero`, enquanto o dado
enviado ao backend é chamado `telefone`.

### 4.7 Botões Alterar e Excluir

Foi adicionado ao JavaScript um botão **Alterar** para cada usuário:

1.  Ao clicar em **Alterar**, os dados daquele usuário são colocados no
    formulário.
2.  O texto do botão principal muda para **Salvar alterações**.
3.  Ao enviar o formulário, o frontend usa `PUT` em vez de `POST`.
4.  Após salvar, a lista é carregada novamente.

O botão **Excluir** solicita confirmação antes de apagar o cadastro.

Foram sugeridos ajustes de CSS para padronizar as dimensões dos botões e
inverter a ordem entre **Alterar** e **Excluir**. **Essas últimas
mudanças visuais não foram aplicadas**, pois a decisão foi manter o
visual anterior.

## 5. Estilo e responsividade

O CSS discutido inclui:

-   Fonte com preferência por Inter e fontes de sistema.
-   Fundo em tom claro e cartões brancos com bordas arredondadas.
-   Formulário e tabela lado a lado em telas maiores.
-   Layout em uma coluna em telas menores.
-   Campos com bordas e efeitos de foco.
-   Mensagens de sucesso e erro.
-   Tabela com rolagem horizontal quando necessário.
-   Estilo próprio para o seletor de nível.
-   Estilos para os botões de confirmação, alteração e exclusão.

Os ajustes propostos para mudar a ordem e igualar o tamanho dos botões
foram recusados; portanto, o projeto deve continuar com o CSS anterior a
essa proposta, conforme a escolha feita.

## 6. Configuração e execução

### Pré-requisitos

-   Node.js instalado.
-   Dependências do backend instaladas.
-   Arquivo SQLite correto localizado em `backend/data/`.
-   Banco configurado no `server.js` com o caminho correspondente ao
    arquivo aberto no Letos.

### Instalar as dependências

No terminal, entre na pasta do backend:

``` bash
cd "Sistema de Cadastro/backend"
npm install
```

### Iniciar o servidor

Use o comando definido no `package.json`. Caso exista um script `start`,
normalmente será:

``` bash
npm start
```

Se o projeto estiver configurado para iniciar diretamente o arquivo
`server.js`, também pode ser necessário usar:

``` bash
node server.js
```

Abra o `index.html` pelo ambiente local que você costuma usar e confirme
que o frontend está apontando para `http://localhost:3000/usuarios`.

### Conferir o banco no Letos

1.  Abra o arquivo de banco configurado no `server.js`.
2.  Confira se a tabela `usuarios` existe.
3.  Confira se ela contém as colunas `id`, `nome`, `codinome`, `email`,
    `nivel` e `telefone`.
4.  Faça um cadastro pelo site.
5.  Atualize a visualização da tabela no Letos e confira se o registro
    foi gravado.

Se o site mostrar os usuários, mas a tabela no Letos continuar vazia,
verifique se o servidor está usando outro arquivo `.db`.

## 7. Observações importantes

-   Com `AUTOINCREMENT`, os IDs excluídos não precisam ser reutilizados.
    Por exemplo, após excluir o ID `2`, o próximo cadastro pode receber
    o ID `3`. Isso é comportamento esperado.
-   O e-mail tem restrição de unicidade no banco. O backend deve
    retornar uma mensagem de erro compreensível se o e-mail já estiver
    cadastrado.
-   O HTML, o JavaScript e o backend precisam concordar com os nomes dos
    campos e com o formato das respostas da API.
-   Não mantenha senhas ou outros dados sensíveis em texto simples. A
    versão atual descrita neste README não inclui campo de senha.
-   Não envie arquivos de banco com dados pessoais para repositórios
    públicos.

## 8. Resumo das mudanças

  ------------------------------------------------------------------------
  Área                    Antes de 13/10/2026     A partir de 13/10/2026
  ----------------------- ----------------------- ------------------------
  Persistência            `localStorage` no       API Node.js/Express com
                          navegador               SQLite

  Campos                  Inicialmente nome,      Nome, codinome, e-mail,
                          e-mail, senha,          nível e telefone
                          confirmação, nascimento 
                          e telefone; depois      
                          simplificados para      
                          nome, e-mail e número   

  Lista                   Tabela de usuários no   Tabela carregada da API
                          navegador               

  Cadastro                JavaScript salva no     `POST /usuarios`
                          `localStorage`          

  Edição                  Não registrada na       Botão Alterar e
                          versão inicial          `PUT /usuarios/:id`

  Exclusão                Dependia da             `DELETE /usuarios/:id`
                          implementação local da  
                          versão                  

  Níveis                  Não faziam parte do     Iniciante, Especialista
                          formulário simplificado e Líder

  Banco                   Sem SQLite na primeira  Arquivo SQLite em
                          versão documentada      `backend/data/`

  Aparência               Formulário à esquerda e Layout mantido e
                          tabela à direita        campos/tabela ampliados

  Botões                  Botão de confirmação no Ações Alterar e Excluir
                          formulário              na tabela; mudança de
                                                  ordem/tamanho sugerida,
                                                  mas não aplicada
  ------------------------------------------------------------------------

------------------------------------------------------------------------

**Última atualização deste README:** 14/10/2026.
