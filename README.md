# SETE — Sistema de Apuração Mensal

App de apuração fiscal mensal com importação de PGDAS-D (PDF), Fator R, equiparação hospitalar, retenções e relatório em PDF.

## Rodar
```bash
npm install
npm run dev
```
## Build / Deploy (Vercel)
```bash
npm run build
```
Suba para um repositório e importe na Vercel (detecta Vite automaticamente). Dados ficam no navegador (localStorage).

## Estrutura
- `src/lib/engine.js` — lógica fiscal, tabelas, parser do PGDAS-D
- `src/App.jsx` — interface (editor + relatório)
- `src/index.css` — Tailwind + estilos de impressão + fonte Wildest
