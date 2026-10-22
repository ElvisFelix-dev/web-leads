# CRM NODUS — Frontend

Frontend do CRM imobiliário construído com React 18, Vite e Tailwind CSS.

## Requisitos

- Node.js compatível com Vite 6
- npm

## Desenvolvimento

```bash
npm install
cp .env.example .env
npm run dev
```

No Windows PowerShell, se preferir criar o arquivo manualmente, copie `.env.example` para `.env`.

## Configuração da API

A variável `VITE_API_URL` define a origem da API. Se não for configurada, a aplicação mantém o endpoint de produção legado como fallback para não interromper a instalação atual.

## Scripts

- `npm run dev` — desenvolvimento
- `npm run build` — build de produção
- `npm run lint` — análise estática

## Notas desta migração inicial

- A marca exibida nos metadados e nas referências textuais da interface foi atualizada para **CRM NODUS**.
- Rotas, autenticação, integrações e contratos existentes foram preservados.
- O domínio antigo da API e do hotsite não foi renomeado automaticamente.
- A Central de Follow-ups existente trabalha com uma mensagem por etapa (`D0`, `D1`, `D3`, `D5`, `D7`, `D10`) e os endpoints `/api/lead-follow-up-templates`. Uma interface completa de variações, histórico de uso, consentimento e modo de simulação deve ser conectada somente depois de confirmar que o backend oferece os contratos correspondentes; não foram criados endpoints fictícios nesta etapa.
