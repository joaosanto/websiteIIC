# Website IIC – v2 (Supabase)

Versão de teste em `https://iindustrialconsulting.com/v2/`. **O site atual (raiz) não foi alterado.**

## O que muda face ao site atual
- **Conteúdo guardado no Supabase**: 💾 Publicar grava na base de dados e todos os visitantes veem logo. Antes ficava só no `localStorage` do próprio navegador.
- **Login seguro**: link mágico por email (Supabase Auth). Só podem editar `dantas@`, `general@` e `fausto@iindustrialconsulting.com`, e a regra é aplicada na base de dados (RLS), não apenas no browser.
- **Histórico de versões**: 🕘 Histórico permite ver e repor qualquer versão publicada.
- **Segurança de falha**: se o Supabase falhar, o site mostra o HTML base, nunca fica em branco.
- **Bugs corrigidos**: os textos editados voltavam à versão antiga ao carregar a página (`data-pt` desatualizado); a classe `edit-mode` estava ligada para todos os visitantes; o EN em falta passa a mostrar o PT.
- **Desempenho**: imagens em WebP (hero 870 KB → 109 KB), preload do hero, scroll otimizado, respeito por "reduzir movimento".
- **SEO / partilha**: Open Graph (LinkedIn/WhatsApp), dados estruturados Organization, canonical, favicon, `robots.txt`, `sitemap.xml`.
- **Acessibilidade**: link "saltar para o conteúdo", `<main>`, foco visível, `aria-expanded` no menu, Esc fecha o menu.

## Como editar
1. Abrir `…/v2/?edit=1` e clicar em 🔐.
2. Introduzir o email autorizado e clicar no link recebido.
3. Clicar em ✏️, editar e depois em **💾 Publicar**.
4. Para traduzir: mudar para **EN** e editar os textos. Fica guardado o PT e o EN de cada texto.

## Configuração (uma vez)
1. Criar o projeto Supabase e correr `supabase/schema.sql`.
2. Preencher `config.js` com o URL do projeto e a chave publishable.
3. No Supabase, em **Authentication → URL Configuration**:
   - Site URL: `https://iindustrialconsulting.com`
   - Redirect URLs: `https://iindustrialconsulting.com/**`
4. (Recomendado) Configurar SMTP próprio em Authentication → Emails. O SMTP gratuito do Supabase tem um limite baixo de emails por hora.

## Passar para produção
1. Mover o conteúdo de `v2/` para a raiz, substituindo `index.html`, `main.js`, `admin.js`, `admin.css`, `style.css` e `assets/`.
2. Em `index.html`, apagar a linha `<meta name="robots" content="noindex, nofollow">`.
3. Em `robots.txt`, apagar a linha `Disallow: /v2/`.
4. Apagar ficheiros antigos: `index 1.html`, `.DS_Store`, `assets/Gemini_*.png` (não usados, cerca de 3,9 MB) e `assets/hero_bg.png`.
5. Apagar `LEIA-ME.md` da raiz ou passá-lo para `DEVELOPMENT.md`.
