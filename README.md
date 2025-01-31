# Soho Control

## Descrição do Projeto

Desenvolvi o sistema **Soho Control** com base na minha experiência em vendas (fui vendedor antes de me tornar programador). É um sistema que permite realizar controle de clientes, estoque, vendas e relatórios de forma prática e eficiente. O sistema é voltado para pequenos negócios que buscam organizar suas operações e aumentar a produtividade.

Com Soho Control, é possível:
- Gerenciar informações de clientes.
- Registrar e visualizar vendas.
- Controlar o estoque de produtos.
- Acompanhar dados e gerar relatórios financeiros.

O sistema é totalmente modular, dividido em quatro áreas principais: **Clientes**, **Vendas**, **Estoque** e **Relatórios**.

![Soho Control Demo](soho-control.gif)

---

## Funcionalidades

### **1. Gestão de Clientes**
- Cadastro completo de clientes, incluindo:
  - Nome, CPF/CNPJ, Endereço, Cidade, Estado, Telefone e E-mail.
- Edição e exclusão de informações de clientes.
- Busca de clientes por nome.
- Paginação de clientes para exibição eficiente.

### **2. Controle de Estoque**
- Cadastro de produtos com informações como:
  - Código, Fornecedor, Origem, Nome do Produto, Descrição, Quantidade, Preço de Compra, Imposto e Preço de Venda.
- Edição e exclusão de produtos.
- Busca de produtos por nome.
- Paginação de produtos para exibição organizada.

### **3. Registro de Vendas**
- Registro de vendas, incluindo:
  - Data da venda, cliente, produtos vendidos, quantidades, descontos e frete.
- Cálculo automático de valores:
  - Valor parcial, desconto, frete e valor total.
- Edição e exclusão de vendas.
- Busca de vendas por cliente ou produto.
- Visualização de vendas com paginação.
- Geração de PDF e PNG com descritivo da venda

### **4. Relatórios**
- Gráficos e estatísticas detalhados, incluindo:
  - Total de vendas.
  - Total de descontos aplicados.
  - Frete
  - Impostos
  - Lucro bruto e líquido.
  - Produtos mais vendidos.
  - Clientes que mais compraram.
  - Estoque dos produtos mais vendidos.
- Filtros por período (data inicial e final).

---

## Estrutura do Projeto

O sistema é dividido em várias camadas, cada uma desempenhando um papel específico:

### Frontend
O frontend é desenvolvido utilizando **HTML5**, **CSS3** e **JavaScript**, com suporte da biblioteca **Bootstrap** para estilização e responsividade. As principais funcionalidades incluem:

- Formulários para cadastro de clientes, produtos e vendas.
- Interface amigável e organizada com abas para navegação.
- Gráficos dinâmicos utilizando a biblioteca **ApexCharts**.

### Backend
O backend é desenvolvido em **Java Spring Boot** e expõe APIs REST para manipulação de dados. Principais funcionalidades:

- **Clientes**: Endpoints para CRUD de clientes.
- **Produtos**: Endpoints para CRUD de produtos.
- **Vendas**: Endpoints para registrar, listar e excluir vendas.
- **Relatórios**: Endpoint para gerar dados baseados em filtros.

### Banco de Dados
O sistema utiliza um banco de dados relacional, como **MySQL**, para armazenar as informações. As tabelas principais incluem:
- `Clientes`
- `Produtos`
- `Vendas`
- `ItensVenda`

---

## Tecnologias Utilizadas

- **Frontend**:
  - HTML5, CSS3, JavaScript.
  - Bootstrap.
  - ApexCharts.
  - Express.js.

- **Backend**:
  - Java 17.
  - Spring Boot.
  - REST APIs.

- **Banco de Dados**:
  - MySQL.

- **Outros**:
  - jQuery (para interatividade no frontend).

---

## Instalação e Configuração

### Pré-requisitos
Certifique-se de ter os seguintes softwares instalados:
- **Java 17** ou superior.
- **Maven** para gerenciar dependências.
- **MySQL** como banco de dados.
- **Node.js** para gerenciar dependências do frontend.
- **Express.js** como servidor do frontend.
- 
### Passos para Configuração

1. **Baixar o Projeto no GitHub**:
   - Acesse o repositório: [Soho Control](https://github.com/coderpedrosilva/sohocontrol)
   - Clique no botão **Code** e selecione **Download ZIP**.
   - Extraia o conteúdo do arquivo ZIP para um diretório de sua preferência.
   - Navegue até a pasta do projeto:
   ```bash
   cd sohocontrol
   ```

2. **Configuração do Banco de Dados MySQL**:
   - Crie um banco de dados chamado `soho_control`.
   - Atualize as credenciais no arquivo `application.properties`:
   ```properties
   spring.application.name=sohocontrol 
   spring.datasource.url=jdbc:mysql://localhost:3306/soho_control
   spring.datasource.username=SEU_USUARIO
   spring.datasource.password=SUA_SENHA
   spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
   
   spring.jpa.hibernate.ddl-auto=update
   spring.jpa.show-sql=true
   spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
   ```

3. **Compile o Projeto (Backend)**:
   - Navegue até a pasta do backend:
   ```bash 
   cd sohocontrol_springboot
   ```

4. **Execute o Backend**:
   - Execute esses dois comandos:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

5. **Configuração e Execução do Frontend**:
   - Navegue até a pasta do frontend:
   ```bash
   cd ../sohocontrol_bootstrap
   ```

   - Instale as dependências do projeto:
   ```bash
   npm install
   ```

   - Execute o servidor do frontend:
   ```bash
   node server.js
   ```

6. **Acesse o Sistema**:
   - O **Tela de acesso** estará disponível em `http://localhost:4200`.

---

## Como Contribuir

1. Faça um fork do repositório.
2. Crie uma branch para sua feature:
   ```bash
   git checkout -b minha-feature
   ```
3. Faça commit das suas alterações:
   ```bash
   git commit -m "Descrição da alteração"
   ```
4. Envie para sua branch:
   ```bash
   git push origin minha-feature
   ```
5. Abra um Pull Request no repositório original.

---

## Licença

Este projeto é licenciado sob a **Apache License 2.0**, permitindo uso, modificação, distribuição e venda do software. Atribuição ao autor original é obrigatória, e a licença inclui proteção contra disputas de patentes.

Para mais detalhes visite [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).
