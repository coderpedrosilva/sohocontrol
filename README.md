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

## Gerando um Instalador Completo para o Projeto (Backend + Frontend + MySQL)

Para transformar seu projeto (frontend + backend + banco de dados MySQL) em um único arquivo executável para Windows, siga este plano:

🔹 **Passo 1: Preparando o Backend (Spring Boot)**

Você já tem um projeto Spring Boot. Vamos empacotá-lo como um JAR executável.

📌 **Gerar um único JAR contendo todas as dependências**

No terminal, dentro da pasta `sohocontrol_springboot`, execute:

```
mvn clean package
```

Isso irá gerar um arquivo JAR dentro da pasta `target/`, algo como:

```
target/sohocontrol-1.0.0.jar
```

Esse JAR pode ser executado com:

```
java -jar target/sohocontrol-1.0.0.jar
```

✅ Backend pronto para ser integrado! 🚀

---

🔹 **Passo 2: Preparando o Frontend (Node.js + Express)**

Seu frontend usa Express.js como servidor e está na pasta `sohocontrol_bootstrap`.

📌 **Converter o frontend em um executável**

1️⃣ Instale o `pkg` (ferramenta para empacotar Node.js):

```
npm install -g pkg
```

2️⃣ Dentro da pasta `sohocontrol_bootstrap`, execute:

```
pkg server.js --targets win
```

Se der problema siga esses passos:

### Criando o Executável `pkg.cmd` Manualmente

1️⃣ Abra o PowerShell e execute o seguinte comando para criar o arquivo `pkg.cmd`:

```
Set-Content -Path "C:\Users\seuUsuario\AppData\Roaming\npm\pkg.cmd" -Value "@echo off`r`nnode %~dp0\node_modules\pkg\lib-es5\bin.js %*"
```

2️⃣ Agora, tente executar:

```
C:\Users\seuUsuario\AppData\Roaming\npm\pkg.cmd --version
```

Se funcionar, empacote seu `server.js` com:

```
C:\Users\seuUsuario\AppData\Roaming\npm\pkg.cmd server.js --targets win
```

Isso criará um arquivo executável `.exe` na pasta.

✅ Frontend pronto para ser integrado!

---

🔹 **Passo 3: Empacotando o MySQL**

O MySQL precisa estar instalado, então podemos criar um banco de dados portátil.

1️⃣ **Exportar a base de dados**  
No terminal/cmd, execute:

```
mysqldump -u root -p soho_control > sohocontrol.sql
```

Isso cria um arquivo `sohocontrol.sql` contendo todo o banco.

2️⃣ **Criar um script de inicialização do MySQL**  
Se quiser rodar o MySQL automaticamente, você pode usar MariaDB Portable, que não precisa de instalação.

✅ Banco de dados pronto para ser integrado!

---

🔹 **Passo 4: Criando um Executável Único**

Agora, vamos juntar tudo em um único instalador `.exe`.

📌 **Usando Inno Setup**

1️⃣ Instale o Inno Setup.

2️⃣ Crie um arquivo `setup.iss` e adicione:

```
[Setup]
AppName=Soho Control
AppVersion=1.0
DefaultDirName={commonpf}\SohoControl
OutputDir=C:\Users\seuUsuario\Documents\executavel
OutputBaseFilename=sohocontrol_installer
Compression=lzma
SolidCompression=yes
WizardStyle=modern

[Files]
; Servidor executável
Source: "C:\Users\seuUsuario\Documents\sohocontrol\sohocontrol_bootstrap\server.exe"; DestDir: "{app}"

; Views (HTMLs)
Source: "C:\Users\seuUsuario\Documents\sohocontrol\sohocontrol_bootstrap\views\*"; DestDir: "{app}\views"; Flags: recursesubdirs

; Arquivos estáticos (CSS, JS, Imagens, Fontes, Bootstrap)
Source: "C:\Users\seuUsuario\Documents\sohocontrol\sohocontrol_bootstrap\assets\*"; DestDir: "{app}\assets"; Flags: recursesubdirs

; Outros arquivos necessários
Source: "C:\Users\seuUsuario\Documents\executavel\sohocontrol-0.0.1-SNAPSHOT.jar"; DestDir: "{app}"
Source: "C:\Users\seuUsuario\Documents\executavel\sohocontrol.sql"; DestDir: "{app}"
Source: "C:\Users\seuUsuario\Documents\executavel\start.bat"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
; Atalho na área de trabalho
Name: "{commondesktop}\Soho Control"; Filename: "{app}\start.bat"
; Atalho no menu iniciar
Name: "{group}\Soho Control"; Filename: "{app}\start.bat"

[Run]
; Iniciar o servidor após a instalação
Filename: "{app}\start.bat"; Description: "Iniciar o Soho Control"; Flags: nowait postinstall
```

3️⃣ Crie um script `start.bat` para iniciar tudo automaticamente:

```
@echo off
start /B java -jar sohocontrol-1.0.0.jar
start /B server.exe
cd mysql && start /B mysqld --defaults-file=my.ini
exit
```

✅ Agora, compile o instalador no Inno Setup e pronto! Você terá um `.exe` que instala e executa tudo com um clique no Windows.

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
