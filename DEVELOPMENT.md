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
  * Efeito parallax no Hero e animação de contadores de estatísticas.
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

* **⚠️ Limitação importante — elementos com filhos HTML**: A função `setLang` usa `el.textContent = val`, o que **destrói elementos filho** (ex: `<span class="gold-text">`). Por isso, elementos como `<h2>` que contenham spans internos de estilo **não devem ter** `data-pt`/`data-en` no próprio `h2` — os atributos de tradução só funcionam corretamente em **elementos folha** (sem filhos HTML). A correção aplicada em Junho 2026 faz o `setLang` ignorar elementos com filhos, preservando os spans internos.

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

### 4. Comportamento do localStorage no Editor
* O editor guarda o conteúdo em `localStorage` com a chave `iic-cms-v2`. Se o HTML base for alterado (ex: remoção do formulário de contacto), o editor continuará a mostrar o conteúdo antigo guardado.
* **Solução**: Clicar em **🔄 Repor** na barra de edição para limpar o `localStorage` e carregar a versão atual do HTML.

### 5. Regra — contenteditable aninhado
* O editor (`makeTextsEditable`) não deve tornar `contenteditable` elementos que já são filhos de um elemento `contenteditable`. Fazê-lo cria comportamento imprevisível no browser. Correção aplicada em Junho 2026: elementos filhos directos de um `contenteditable` são ignorados pelo `makeTextsEditable`.

### 3. Diferença entre "Guardar" e "Exportar HTML"

Para gerir as suas edições, a barra de ferramentas dispõe de dois botões principais com propósitos diferentes:

* **Guardar (💾)**:
  * **O que faz**: Grava temporariamente o estado atual das suas edições na memória do navegador (`localStorage`).
  * **Para que serve**: Permite que feche o separador ou recarregue a página sem perder o progresso do seu trabalho.
  * **Quem vê**: Apenas você, no mesmo navegador e computador onde editou. Não altera o site para o público nem modifica os ficheiros no servidor.

* **Exportar HTML (📥)**:
  * **O que faz**: Gera e descarrega um ficheiro `index.html` atualizado e "limpo" (removendo scripts de administração, botões de edição temporários e a barra de ferramentas).
  * **Para que serve**: Permite **publicar** as suas edições de forma definitiva.
  * **Como aplicar**: Para que as alterações fiquem visíveis para todo o público, deve substituir o ficheiro `index.html` na pasta do seu projeto pelo ficheiro recém-descarregado e efetuar o envio (deploy/push) para o servidor de alojamento (por exemplo, GitHub Pages).

---

## 🗂 Histórico de Alterações Relevantes

| Data | Alteração |
|------|-----------|
| Jun 2026 | Adicionado modo dia/noite (tema claro/escuro) via `localStorage` |
| Jun 2026 | Corrigido bug: `setLang` destruía spans internos de `h2` com `gold-text` |
| Jun 2026 | Corrigido bug: `makeTextsEditable` criava `contenteditable` aninhados |
| Jun 2026 | Formulário de contacto removido — secção de contacto mostra apenas dados de contacto |

---

*Documentação atualizada em: Junho de 2026.*

