# Planejamento do Sistema de Metas e Lançamentos

## 2.1. Análise das Planilhas do Excel e Identificação de Entidades

Com base na análise do arquivo `Análise.xlsx`, as seguintes planilhas e suas prováveis finalidades foram identificadas:

*   **Metas**: Contém as metas de produção e valores associados para diferentes produtos ou áreas. Esta planilha será fundamental para a definição das metas no sistema.
*   **Alça, Fundo, Topo, Acessório, Líner, Mesa, Corte-Carimbadeira**: Estas planilhas parecem registrar os lançamentos diários de produção para cada área/produto. Elas contêm informações como data, quantidade realizada, saldo e valor. Serão a base para os lançamentos de dados no sistema.
*   **fechamento**: Esta planilha sumariza os dados de produção por colaborador, incluindo total produzido, média, valor a receber e observações (como férias, falta, treinamento). Será utilizada para gerar relatórios e consultas de desempenho individual.
*   **Geral**: Não foi possível inferir a finalidade exata desta planilha apenas pelo nome e pelo conteúdo parcial. Pode conter dados gerais ou consolidados.
*   **Planilha2**: Similar à planilha 'Geral', a finalidade não é clara. Pode ser uma planilha de rascunho ou com dados auxiliares.

### Entidades e Atributos Propostos:

Com base na análise, as seguintes entidades e seus atributos são propostos para o banco de dados do sistema:

#### 1. `AreasProducao`
Esta tabela armazenará as diferentes áreas de produção ou categorias de produtos, que correspondem às planilhas individuais de lançamento (Alça, Fundo, Topo, etc.).

*   `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT): Identificador único da área de produção.
*   `nome` (TEXT, NOT NULL, UNIQUE): Nome da área de produção (ex: 'Alça', 'Fundo', 'Topo', 'Líner', 'Mesa de Dobra', 'Acessório', 'Corte-Carimbadeira').

#### 2. `Colaboradores`
Esta tabela armazenará as informações dos colaboradores, extraídas principalmente da planilha 'fechamento' e de outras menções em `sharedStrings.xml`.

*   `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT): Identificador único do colaborador.
*   `nome` (TEXT, NOT NULL, UNIQUE): Nome completo do colaborador.

#### 3. `Metas`
Esta tabela armazenará as metas estabelecidas para cada área de produção, possivelmente com um valor monetário associado. Os dados virão da planilha 'Metas'.

*   `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT): Identificador único da meta.
*   `area_id` (INTEGER, FOREIGN KEY, NOT NULL): Referência à `AreasProducao.id`.
*   `meta_quantidade` (INTEGER, NOT NULL): Quantidade da meta (ex: 160, 280, 250).
*   `valor_unitario` (REAL, NOT NULL): Valor monetário associado à meta por unidade (ex: 350.00, 200.00).
*   `data_vigencia` (DATE, NOT NULL): Data a partir da qual esta meta é válida (para permitir metas variáveis ao longo do tempo).

#### 4. `LancamentosProducao`
Esta tabela armazenará os lançamentos diários de produção para cada área e colaborador. Os dados virão das planilhas 'Alça', 'Fundo', 'Topo', etc.

*   `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT): Identificador único do lançamento.
*   `data` (DATE, NOT NULL): Data do lançamento.
*   `area_id` (INTEGER, FOREIGN KEY, NOT NULL): Referência à `AreasProducao.id`.
*   `colaborador_id` (INTEGER, FOREIGN KEY, NOT NULL): Referência à `Colaboradores.id`.
*   `quantidade_realizada` (INTEGER, NOT NULL): Quantidade produzida no dia.
*   `saldo` (INTEGER): Saldo em relação à meta (pode ser calculado ou armazenado).
*   `valor_receber` (REAL): Valor a receber pelo lançamento (pode ser calculado ou armazenado).

#### 5. `ObservacoesColaborador`
Esta tabela armazenará observações específicas sobre os colaboradores, como férias, faltas ou treinamentos, extraídas da planilha 'fechamento'.

*   `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT): Identificador único da observação.
*   `colaborador_id` (INTEGER, FOREIGN KEY, NOT NULL): Referência à `Colaboradores.id`.
*   `data` (DATE, NOT NULL): Data da observação.
*   `tipo_observacao` (TEXT, NOT NULL): Tipo da observação (ex: 'férias', 'falta', 'treinamento').
*   `descricao` (TEXT): Descrição detalhada da observação.

## 2.2. Definição do Esquema do Banco de Dados

O banco de dados será relacional, utilizando SQLite para simplicidade no desenvolvimento e implantação inicial. As tabelas serão criadas com os atributos definidos acima, incluindo chaves primárias, chaves estrangeiras e restrições de nulidade e unicidade quando aplicável.

### Exemplo de Esquema SQL (SQLite):

```sql
CREATE TABLE AreasProducao (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE
);

CREATE TABLE Colaboradores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE
);

CREATE TABLE Metas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    area_id INTEGER NOT NULL,
    meta_quantidade INTEGER NOT NULL,
    valor_unitario REAL NOT NULL,
    data_vigencia DATE NOT NULL,
    FOREIGN KEY (area_id) REFERENCES AreasProducao(id)
);

CREATE TABLE LancamentosProducao (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data DATE NOT NULL,
    area_id INTEGER NOT NULL,
    colaborador_id INTEGER NOT NULL,
    quantidade_realizada INTEGER NOT NULL,
    saldo INTEGER, -- Pode ser calculado dinamicamente
    valor_receber REAL, -- Pode ser calculado dinamicamente
    FOREIGN KEY (area_id) REFERENCES AreasProducao(id),
    FOREIGN KEY (colaborador_id) REFERENCES Colaboradores(id)
);

CREATE TABLE ObservacoesColaborador (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    colaborador_id INTEGER NOT NULL,
    data DATE NOT NULL,
    tipo_observacao TEXT NOT NULL,
    descricao TEXT,
    FOREIGN KEY (colaborador_id) REFERENCES Colaboradores(id)
);
```

## 2.3. Esboço das Funcionalidades do Sistema

O sistema será desenvolvido como uma aplicação web, com um backend (API RESTful) e um frontend (interface de usuário).

### Funcionalidades do Backend (API RESTful):

*   **Gerenciamento de Áreas de Produção**: CRUD (Create, Read, Update, Delete) para as áreas de produção.
*   **Gerenciamento de Colaboradores**: CRUD para os colaboradores.
*   **Gerenciamento de Metas**: CRUD para as metas, permitindo definir metas por área e período.
*   **Lançamento de Produção**: Endpoint para registrar a produção diária de um colaborador em uma área específica. Este endpoint calculará automaticamente o saldo em relação à meta e o valor a receber com base nas metas vigentes.
*   **Consultas de Dados**: Endpoints para consultar lançamentos por data, colaborador, área, etc.
*   **Geração de Relatórios**: Endpoints para gerar relatórios sumarizados (ex: produção total por área, desempenho individual de colaboradores, comparação com metas).

### Funcionalidades do Frontend (Interface de Usuário):

*   **Dashboard**: Visão geral do desempenho atual, metas e lançamentos recentes.
*   **Tela de Lançamento de Produção**: Formulário intuitivo para que os usuários possam registrar a produção diária, selecionando a área, colaborador, data e quantidade realizada. O sistema exibirá o saldo e o valor a receber em tempo real.
*   **Gerenciamento de Metas**: Interface para visualizar, adicionar, editar e remover metas.
*   **Gerenciamento de Colaboradores e Áreas**: Telas para cadastrar e gerenciar colaboradores e áreas de produção.
*   **Relatórios e Consultas**: Seções para gerar relatórios personalizados, com filtros por data, colaborador, área, tipo de observação, etc. Os relatórios podem ser exibidos em tabelas e gráficos.
*   **Visualização de Observações**: Tela para visualizar e gerenciar observações sobre os colaboradores.

## 2.4. Documentação do Planejamento do Sistema

Este documento serve como a documentação inicial do planejamento do sistema, detalhando a análise das planilhas, a estrutura de dados proposta e as funcionalidades esperadas. Será atualizado conforme o desenvolvimento avança.

