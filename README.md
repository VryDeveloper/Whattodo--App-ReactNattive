# "Whattodo?" - Horizon Challenge — Teste Técnico Mobile Júnior

App de CRUD de tarefas (To-Do) desenvolvido para o teste técnico da vaga
**Desenvolvedor(a) Mobile Júnior I** da Horizon Inovação e Tecnologia.


<img width="400" height="800" alt="localhost_8081_" src="https://github.com/user-attachments/assets/c56b6a76-4687-4e14-9082-2f5652ea1282" />


Consome a API pública [JSONPlaceholder](https://jsonplaceholder.typicode.com/todos).

## Funcionalidades

- Listar, criar, editar, excluir e ver detalhe de tarefas
- Busca/filtro local pelo título
- Descrição, data/hora e lembrete opcionais por tarefa
- Notificação local no horário da tarefa, com ações rápidas direto na
  notificação: **Adiar 30 min** ou **Concluir tarefa**
- Ações rápidas na listagem: concluir (checkbox) e excluir, sem abrir a tarefa
- Animação ao concluir: o checkbox pisca em verde e a tarefa desliza até a
  área de concluídas na lista
- Aba de **Configurações**: ativar/desativar lembretes, antecedência padrão do
  lembrete, ordenar pendentes primeiro, limpar tarefas concluídas
- Estados de carregando / erro (com "tentar novamente") / lista vazia
- Uso parcial offline na segunda abertura (cache local via AsyncStorage)

## Stack escolhida

**React Native (Expo, SDK 57) + TypeScript.** Optei por essa stack por ter mais
afinidade com o ecossistema JS/TS (React, Node) no meu dia a dia.

- **Navegação:** React Navigation — bottom tabs ("Tarefas" e "Configurações")
  e, dentro da aba Tarefas, uma stack (native-stack) para listar/detalhar/editar
- **Estado global:** Context API + hooks — `TodoContext` (CRUD de tarefas) e
  `SettingsContext` (preferências do app) — dispensa uma lib de estado externa
  para o tamanho deste projeto
- **Persistência local:** `@react-native-async-storage/async-storage`
  (tarefas e preferências)
- **Notificações locais:** `expo-notifications`, para lembretes agendados por
  tarefa e ações rápidas na própria notificação
- **Seleção de data/hora:** `@react-native-community/datetimepicker`
- **Testes:** Jest (unitários sobre validação e cálculo de horário do lembrete)

## Como rodar o projeto

```bash
npm install
npx expo start
```

Abra no emulador (Android/iOS) ou no app **Expo Go** escaneando o QR code. Se o
celular e o computador não conseguirem se enxergar na mesma rede (firewall,
rede corporativa, isolamento de rede no roteador), use `npx expo start --tunnel`.

> O Expo Go da loja de apps só roda a versão mais recente do SDK do Expo. Se
> aparecer "Project is incompatible with this version of Expo Go", o projeto
> (`expo` no `package.json`) está desatualizado em relação ao SDK que o Expo Go
> instalado espera — rode `npx expo install expo@<versão mais recente>` seguido
> de `npx expo install --fix` para realinhar as demais dependências.

Se o `npm install` reclamar de versões incompatíveis com o SDK do Expo instalado
na sua máquina, rode `npx expo install` para as libs nativas (React Navigation,
AsyncStorage, react-native-screens, react-native-safe-area-context) — ele ajusta
as versões automaticamente para a versão do Expo SDK que você tiver.

### O que esperar em cada ambiente

- **Celular real com Expo Go:** funciona por completo — lembrete agendado,
  banner de notificação, as duas ações rápidas (Adiar 30 min / Concluir) e os
  diálogos de confirmação (excluir tarefa, limpar concluídas).
- **Web (`npx expo start --web` / `npm run web`):** duas limitações conhecidas,
  ambas por causa de APIs nativas sem equivalente no navegador:
  - **Notificações:** o navegador não tem um sistema de notificações locais
    agendadas equivalente ao do SO, então o lembrete em si não dispara.
  - **Confirmações (`Alert.alert`) não aparecem:** o `Alert` do React Native é
    um no-op no `react-native-web` (não existe `window.confirm` por trás) —
    então os botões que dependem de confirmação (**excluir uma tarefa** na
    listagem e no detalhe, **limpar tarefas concluídas** nas Configurações)
    não fazem nada visível ao serem clicados no navegador, porque o diálogo
    que conteria o botão "Excluir"/"Confirmar" nunca é exibido. Não é um bug
    do app — é uma limitação de compatibilidade do `Alert` no React Native
    Web. O restante do CRUD (criar, editar, listar, buscar, concluir/reabrir
    pelo checkbox) funciona normalmente no navegador.
- **Emulador Android sem Google Play Services / simulador iOS:** permissão de
  notificação pode não estar disponível dependendo da imagem do emulador.

> **Recomendação para a avaliação:** testar em um celular real via Expo Go
> (ou em emulador Android/iOS) para ver a experiência completa, incluindo
> notificações e as confirmações de exclusão. A versão web serve para uma
> conferência rápida do CRUD e do layout, mas com essas duas ressalvas.

### Rodar os testes

```bash
npm test
```

## Decisões de projeto e critérios adotados

- **A API simula as respostas de criar/editar/excluir** (retorna sucesso, mas
  não persiste de verdade). Por isso o app trata o `AsyncStorage` como a fonte
  de verdade: toda operação de CRUD chama a API (simulada) e, independente do
  resultado dela, atualiza o estado local e o cache — exatamente como
  descrito na observação do enunciado.
- **IDs de tarefas criadas localmente** são gerados com `Date.now()`, para
  nunca colidir com os IDs (1–200) devolvidos pela API real.
- **Merge cache + API na listagem:** ao abrir o app, primeiro carrega o cache
  local (permite uso parcial offline) e, em seguida, busca a API; tarefas
  criadas localmente (que não existem na API) são preservadas no merge.
- **Busca/filtro:** feito 100% em memória sobre a lista já carregada — não
  dispara nenhuma chamada à API a cada tecla digitada.
- **Estados de UI:** carregamento, erro (sem conexão, com botão de "tentar
  novamente") e lista vazia são tratados como telas/estados distintos na tela
  de listagem.
- **Validação do formulário:** título obrigatório, entre 3 e 100 caracteres,
  com feedback visual de erro inline (função pura e testada em
  `src/utils/validation.ts`).
- **Exclusão:** exige confirmação via `Alert` antes de remover a tarefa.
- **Limite de itens na listagem inicial:** busco os 20 primeiros itens da API
  (`?_limit=20`) para manter a lista enxuta na avaliação; ajustável em
  `src/services/api.ts`.
- **Títulos das tarefas iniciais:** o JSONPlaceholder devolve títulos em
  "lorem ipsum" sem sentido (ex: "delectus aut autem"). Como isso é só para
  popular a listagem de exemplo, o `id`/`completed`/`userId` continuam vindo
  da API, mas o título é substituído por uma lista local de tarefas do dia a
  dia (comprar leite, lavar o carro, pagar conta de luz, etc.) em
  `src/services/api.ts`, para a demonstração ficar mais realista.
- **Descrição, data/hora e notificação são extensões locais da tarefa:** o
  JSONPlaceholder não conhece esses campos (só `title`, `completed`, `userId`).
  Eles vivem inteiramente no app (`AsyncStorage`); ao buscar/mesclar dados da
  API, cada tarefa remota recebe valores padrão para esses campos
  (`src/services/api.ts` e `src/services/storage.ts`), então tarefas antigas
  no cache (de antes dessa funcionalidade existir) continuam abrindo normalmente.
- **Lembretes são notificações locais agendadas no próprio dispositivo**
  (`expo-notifications`), não push notifications de servidor — não há backend
  próprio no escopo deste teste, e o JSONPlaceholder não teria como disparar
  push de verdade. O id da notificação agendada fica salvo na própria tarefa
  (`notificationId`) para poder cancelá-la exatamente quando a tarefa é
  editada, concluída ou excluída.
- **Ação "Adiar 30 min" da notificação** agenda um novo lembrete a partir do
  momento em que o usuário toca no botão (agora + 30 min), sem alterar a
  data/hora original da tarefa — a ideia é "me lembre de novo em pouco", não
  "mudar quando a tarefa deveria acontecer".
- **Seletor de data/hora com fallback para web:**
  `@react-native-community/datetimepicker` não tem implementação para a
  plataforma web (renderiza `null`). `src/components/DateTimeField.tsx` detecta
  a plataforma e usa o picker nativo em iOS/Android, com inputs HTML nativos de
  data/hora (`<input type="date/time">`) como alternativa no navegador.
- **Ações rápidas na listagem** (concluir com um toque no checkbox, excluir
  com confirmação) chamam diretamente o `TodoContext`, sem navegar para a tela
  de detalhe — pensado para o fluxo mais comum de um app de tarefas (marcar
  como feito rapidinho, sem abrir mais telas).
- **Configurações do app** ficam numa aba própria e cobrem: ativar/desativar
  lembretes no geral, antecedência padrão do lembrete (na hora, 10/30/60 min
  antes), ordenar pendentes primeiro na listagem e limpar tarefas concluídas
  em lote. Tudo persistido localmente e desacoplado do `TodoContext` via
  `SettingsContext`, para não misturar "dado da tarefa" com "preferência do
  usuário".

## Estrutura do projeto

```
src/
  types/        # tipos do domínio (Todo, NewTodo, LoadStatus, AppSettings)
  services/     # api.ts, storage.ts, settingsStorage.ts, notifications.ts
  context/      # TodoContext.tsx (CRUD + lembretes) e SettingsContext.tsx
  hooks/        # useNotificationResponseListener.ts (ações da notificação)
  navigation/   # tabs (Tarefas/Configurações) + stack interna da aba Tarefas
  screens/      # TodoListScreen, TodoDetailScreen, TodoFormScreen, SettingsScreen
  components/   # TodoItem, SearchBar, DateTimeField, LoadingState, ErrorState, EmptyState
  utils/        # validation.ts, reminderTime.ts
__tests__/      # testes unitários (Jest)
```

## Possíveis melhorias futuras

- Testes de componente com React Native Testing Library
- Animações de transição entre telas
- Debounce visual na busca (hoje já não gera chamadas à API, mas poderia
  suavizar a filtragem em listas muito grandes)
- Notificações push reais via backend próprio (hoje são só lembretes locais)
- Tema escuro, configurável na aba de Configurações
