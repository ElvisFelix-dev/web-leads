# Central de Notificações — Frontend (etapa 2)

## O que foi adicionado

- `src/context/NotificationContext.jsx`
  - Busca o contador de notificações não lidas.
  - Escuta o evento Socket.IO `notification:new` usando o socket já mantido pelo `ChatContext`.
  - Atualiza o contador e exibe um toast clicável para a nova notificação.
- `src/pages/NotificationCenter.jsx`
  - Central visual com histórico, filtro de todas/não lidas, prioridade, data, marcação como lida, exclusão e paginação.
- `src/App.jsx`
  - Nova rota `/notifications`.
- `src/components/Sidebar.jsx`
  - Link para a Central nos menus de gestor e corretor, com contador de não lidas.
- `src/main.jsx`
  - `NotificationProvider` dentro de `ChatProvider`, para reutilizar a conexão Socket.IO existente.
- `public/sw.js`
  - Clique em push agora reconhece `data.link`, além de `data.url`.

## Compatibilidade necessária

Este frontend usa os endpoints do backend incluído na etapa 1:

- `GET /api/notifications?page=1&limit=20&unreadOnly=false`
- `GET /api/notifications/unread-count`
- `PATCH /api/notifications/:id/read`
- `PATCH /api/notifications/read-all`
- `DELETE /api/notifications/:id`

O frontend e o backend precisam estar implantados juntos para a Central funcionar. A URL da API continua configurada em `src/service/api.jsx`, conforme o projeto original.

## Teste manual recomendado

1. Instale as dependências do projeto e execute `npm run build`.
2. Entre no CRM com um gestor e depois com um corretor.
3. Acesse `/notifications` e confira o histórico vazio/inicial e o contador.
4. Gere um evento real no backend, por exemplo, um lead novo ou uma proposta aguardando aprovação.
5. Confirme que o destinatário correto recebe o toast em tempo real e o contador aumenta.
6. Clique na notificação, confirme a navegação e que ela passa a constar como lida.
7. Teste o filtro Não lidas, Marcar todas como lidas e Excluir.
8. Ative as notificações do navegador pelo menu de perfil e teste o push com a aba em segundo plano.

## Limitações conhecidas da integração

- O backend da etapa 1 não possui um modelo de tarefas/follow-ups separado; os lembretes conectados são os compromissos existentes em visitas/agenda.
- O backend recebido não apresenta um identificador explícito de imobiliária/tenant. Antes de compartilhar um banco entre empresas, é necessário implementar isolamento por organização no backend.
- A compilação Vite não pôde ser concluída neste ambiente porque a instalação de dependências não terminou e o binário `vite` não ficou disponível. Os arquivos JSX modificados passaram por verificação sintática.
