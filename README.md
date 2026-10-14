# Site — Dr. Christian Queiroga

Landing page estática (HTML + CSS + JS, sem build). Abra `index.html` com um servidor local (ex.: extensão Live Server do VS Code).

## Estrutura

```
index-producao.html            VERSÃO PARA PUBLICAR (sem orientações, conteúdo definitivo)
index.html                     versão principal (escura) — rascunho com orientações
index-claro.html               versão clara com elementos odontológicos (usa style.css + claro.css)
quadros-atendidos-versoes.html 2 alternativas para a seção "Quadros atendidos"
assets/css/claro.css           camada de estilos da versão clara
assets/css/producao.css        camada de estilos da versão de produção
assets/img/quadros/            fotos dos quadros atendidos (Unsplash, ver CREDITOS.txt)
assets/img/arcada.svg          ornamento da arcada dentária
assets/css/style.css     estilos (cores em :root)
assets/js/main.js        animações GSAP, preloader, formulário
assets/img/              logos
assets/img/placeholders/ imagens provisórias (substituir)
```

## Orientações de conteúdo

Cada seção tem uma caixa tracejada "Orientação" explicando o que escrever ali. O botão **Orientações: ON/OFF** (canto inferior esquerdo) mostra ou esconde essas caixas. Quando o conteúdo final estiver pronto, apague os elementos `<aside class="guide">` e o `<button class="guide-toggle">` do `index.html`.

## Imagens para substituir

| Arquivo provisório | Onde aparece | Tamanho sugerido |
|---|---|---|
| `hero-desktop.svg` | Fundo da hero (desktop) | 1920 × 1080 px, Dr. à direita |
| `hero-mobile.svg` | Topo da hero no celular | 1080 × 1200 px |
| `sobre-retrato.svg` | Quem sou eu | 900 × 1125 px (4:5) |
| `timeline-01…04.svg` | Linha do tempo | 1200 × 900 px (4:3) |
| `quadro-01…07.svg` | Imagem que segue o mouse em "Quadros atendidos" | 800 × 1000 px |
| `consultorio.svg` | Onde atendo | 1200 × 800 px (3:2) |

Use `.jpg`/`.webp` otimizados e atualize os caminhos no `index.html` (a hero desktop está no `style="background-image:…"` da `.hero__bg`).

## Outros ajustes

- WhatsApp do formulário: `WHATSAPP_NUMBER` no topo de `assets/js/main.js`.
- Mapa: troque o texto após `q=` no `<iframe>` da seção "Onde atendo".
- CRO, endereço, telefone e e-mail: busque por `CRO-UF 00000`, `Rua Exemplo` e `(00) 00000-0000`.
