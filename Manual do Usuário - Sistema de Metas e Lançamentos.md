# Manual do Usuário - Sistema de Metas e Lançamentos

## Visão Geral

O Sistema de Metas e Lançamentos é uma aplicação web desenvolvida para gerenciar a produção industrial, permitindo o controle de metas, lançamentos diários de produção e geração de relatórios detalhados.

## Acesso ao Sistema

O sistema está disponível em: **https://19hnincl6x09.manus.space**

## Funcionalidades Principais

### 1. Dashboard
- **Localização**: Página inicial do sistema
- **Função**: Apresenta uma visão geral com estatísticas principais:
  - Total de áreas cadastradas
  - Número de colaboradores
  - Metas ativas
  - Total de lançamentos
- **Recursos adicionais**:
  - Lista dos 5 lançamentos mais recentes
  - Ações rápidas para navegação

### 2. Gerenciamento de Áreas de Produção
- **Localização**: Menu "Áreas"
- **Função**: Cadastrar e gerenciar as diferentes áreas de produção
- **Como usar**:
  1. Clique em "Nova Área"
  2. Digite o nome da área (ex: Alça, Fundo, Topo, Líner)
  3. Clique em "Criar"
- **Ações disponíveis**: Criar, editar e excluir áreas

### 3. Gerenciamento de Colaboradores
- **Localização**: Menu "Colaboradores"
- **Função**: Cadastrar e gerenciar os colaboradores da empresa
- **Como usar**:
  1. Clique em "Novo Colaborador"
  2. Digite o nome completo do colaborador
  3. Clique em "Criar"
- **Ações disponíveis**: Criar, editar e excluir colaboradores

### 4. Gerenciamento de Metas
- **Localização**: Menu "Metas"
- **Função**: Definir metas de produção por área com valores associados
- **Como usar**:
  1. Clique em "Nova Meta"
  2. Selecione a área de produção
  3. Digite a quantidade meta (ex: 160 unidades)
  4. Digite o valor unitário (ex: R$ 350,00)
  5. Defina a data de vigência (opcional)
  6. Clique em "Criar"
- **Importante**: As metas são usadas para calcular automaticamente os valores a receber nos lançamentos

### 5. Lançamentos de Produção
- **Localização**: Menu "Lançamentos"
- **Função**: Registrar a produção diária dos colaboradores
- **Como usar**:
  1. Clique em "Novo Lançamento"
  2. Selecione a data
  3. Escolha a área de produção
  4. Selecione o colaborador
  5. Digite a quantidade realizada
  6. Clique em "Criar"
- **Cálculos automáticos**:
  - **Saldo**: Diferença entre quantidade realizada e meta
  - **Valor a receber**: Calculado com base na meta e valor unitário
- **Filtros disponíveis**: Data, área, colaborador

### 6. Observações
- **Localização**: Menu "Observações"
- **Função**: Registrar observações sobre colaboradores (férias, faltas, treinamentos)
- **Como usar**:
  1. Clique em "Nova Observação"
  2. Selecione o colaborador
  3. Defina a data
  4. Escolha o tipo (férias, falta, treinamento, atestado, licença, outros)
  5. Adicione uma descrição (opcional)
  6. Clique em "Criar"
- **Filtros disponíveis**: Data, colaborador, tipo de observação

### 7. Relatórios
- **Localização**: Menu "Relatórios"
- **Função**: Gerar relatórios de produção e desempenho
- **Tipos de relatórios**:
  - **Por Colaborador**: Mostra produção total, média diária e valor a receber por colaborador
  - **Por Área**: Mostra produção total, média diária e valor investido por área
- **Como usar**:
  1. Defina o período (data início e fim)
  2. Clique em "Gerar Relatórios"
  3. Navegue entre as abas "Por Colaborador" e "Por Área"
  4. Use "Exportar CSV" para baixar os dados

## Fluxo de Trabalho Recomendado

### Configuração Inicial
1. **Cadastre as áreas de produção** (Alça, Fundo, Topo, etc.)
2. **Cadastre os colaboradores**
3. **Defina as metas** para cada área com valores correspondentes

### Uso Diário
1. **Registre os lançamentos** de produção diários
2. **Adicione observações** quando necessário (férias, faltas, etc.)

### Análise Periódica
1. **Gere relatórios** para avaliar desempenho
2. **Ajuste metas** conforme necessário

## Características Técnicas

### Cálculo de Valores
O sistema calcula automaticamente o valor a receber baseado na seguinte lógica:
- **Se atingiu a meta**: Valor base + proporcional ao excesso
- **Se não atingiu a meta**: Valor proporcional à quantidade produzida

### Validações
- Não permite lançamentos duplicados (mesmo colaborador, área e data)
- Campos obrigatórios são validados
- Nomes únicos para áreas e colaboradores

### Filtros e Pesquisas
- Todos os módulos possuem filtros para facilitar a localização de dados
- Relatórios podem ser filtrados por período específico

## Suporte

Para dúvidas ou problemas técnicos, entre em contato com o administrador do sistema.

## Observações Importantes

- O sistema calcula automaticamente saldos e valores baseados nas metas vigentes
- Dados são salvos automaticamente após cada operação
- Relatórios podem ser exportados em formato CSV para análise externa
- O sistema é responsivo e funciona em dispositivos móveis e desktop

