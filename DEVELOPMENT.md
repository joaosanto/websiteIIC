# Documentação de Desenvolvimento – Website IIC

Este ficheiro serve como guia e histórico de alterações para qualquer programador ou assistente de IA que necessite de efetuar modificações neste website. **Por favor, consulte esta documentação antes de realizar qualquer alteração.**

---

## 📂 Estrutura de Ficheiros

O website é totalmente estático (HTML/CSS/JS nativos) e está estruturado da seguinte forma:

* **[index.html](file:///Users/joao.santo/Documents/GitHub/websiteIIC/index.html)**: Estrutura principal da página única (Single Page) do website.
* **[style.css](file:///Users/joao.santo/Documents/GitHub/websiteIIC/style.css)**: Estilos globais, tipografia (Outfit e Inter), sistema de grelhas, cores e regras de responsividade do website público.
* **[main.js](file:///Users/joao.santo/Documents/GitHub/websiteIIC/main.js)**: Lógica do utilizador final:
  * Sistema de tradução (PT/EN).
  * Animações ao fazer scroll (Intersection Observer).
  * Comportamento do menu hambúrguer e barra de navegação.
  * Formulário de contacto e efeito parallax no Hero.
* **[admin.js](file:///Users/joao.santo/Documents/GitHub/websiteIIC/admin.js)**: Lógica do CMS visual (Editor) para alteração de textos e secções em tempo real.
* **[admin.css](file:///Users/joao.santo/Documents/GitHub/websiteIIC/admin.css)**: Estilos da barra de ferramentas, botões e modais do CMS.
* **[assets/](file:///Users/joao.santo/Documents/GitHub/websiteIIC/assets)**: Pasta que contém imagens, logótipos e outros recursos visuais.

---

## 🌐 Sistema de Tradução (PT/EN)

O website utiliza um sistema de tradução dinâmico baseado em atributos HTML (`data-pt` e `data-en`) controlado pelo [main.js](file:///Users/joao.santo/Documents/GitHub/websiteIIC/main.js).

* **Como funciona**:
  ```html
  <h2 data-pt="Serviços" data-en="Services">Serviços</h2>
  ```
* **Regra importante**: Ao adicionar novos elementos de texto no HTML, deve sempre incluir os atributos `data-pt` e `data-en` para que a comutação de idioma funcione corretamente.

---

## ✏️ Sistema CMS Visual (admin.js)

O website possui um gestor de conteúdos visual integrado que corre diretamente no navegador.

### 1. Como Aceder ao Modo de Edição
Por motivos de segurança e privacidade, o botão de edição (✏️) está **ocultado por defeito** para o público.
* Para aceder ao editor, deve adicionar o parâmetro `?edit=1` ao URL no seu navegador:
  * Exemplo local: `http://localhost:3000/?edit=1` (ou abrindo o ficheiro local no navegador com `?edit=1` no final).
* Uma vez acedido este link, o navegador guarda um token (`iic-admin-authorized = true`) no `localStorage` e o botão ✏️ passa a aparecer sempre no canto inferior direito.
* Para voltar a ocultar o botão, clique em **Sair (🚪)** na barra de ferramentas de edição.

### 2. Funcionalidades do Editor
* **Edição de Texto**: Clique em qualquer texto no ecrã para o alterar.
* **Secções**: Ative/desative a visibilidade ou apague secções do site.
* **Menu**: Adicione, reordene ou elimine links de navegação.
* **Gestão de Blocos**: Adicione, duplique ou elimine Serviços, Áreas de Negócio ou Membros da Equipa.

### 3. Como Publicar Alterações (Exportação HTML)
As edições efetuadas no editor visual são guardadas temporariamente no seu navegador. Para as tornar públicas para todos os utilizadores:
1. No menu de edição, clique no botão **Exportar HTML (📥)**.
2. O sistema gerará automaticamente e descarregará um novo ficheiro `index.html`.
3. Este ficheiro exportado é **completamente limpo**: remove todos os botões de edição, barra de ferramentas, classes temporárias, e os próprios ficheiros `admin.js` e `admin.css`, garantindo que o site público fica leve e sem código administrativo exposto.
4. Substitua o ficheiro [index.html](file:///Users/joao.santo/Documents/GitHub/websiteIIC/index.html) na pasta do seu projeto por este ficheiro descarregado e envie as alterações para o servidor (deploy/GitHub).

---

*Documentação atualizada em: Junho de 2026.*
