# Horizon To-Do — Teste Técnico Mobile Júnior I

App de CRUD de tarefas (To-Do) desenvolvido para o teste técnico da vaga
**Desenvolvedor(a) Mobile Júnior I** da Horizon Inovação e Tecnologia.

Consome a API pública [JSONPlaceholder](https://jsonplaceholder.typicode.com/todos).

## Stack escolhida

**React Native (Expo) + TypeScript.** Optei por essa stack por ter mais afinidade
com o ecossistema JS/TS (React, Node) no meu dia a dia.

- **Navegação:** React Navigation (native-stack)
- **Estado global:** Context API + hooks (`TodoContext`) — dispensa uma lib
  de estado externa para o tamanho deste projeto
- **Persistência local:** `@react-native-async-storage/async-storage`
- **Testes:** Jest (unitários sobre a camada de validação)

## Como rodar o projeto

```bash
npm install
npx expo start
```

Abra no emulador (Android/iOS) ou no app **Expo Go** escaneando o QR code.

Se o `npm install` reclamar de versões incompatíveis com o SDK do Expo instalado
na sua máquina, rode `npx expo install` para as libs nativas (React Navigation,
AsyncStorage, react-native-screens, react-native-safe-area-context) — ele ajusta
as versões automaticamente para a versão do Expo SDK que você tiver.

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

## Estrutura do projeto

```
src/
  types/        # tipos do domínio (Todo, NewTodo, LoadStatus)
  services/     # api.ts (JSONPlaceholder) e storage.ts (AsyncStorage)
  context/      # TodoContext.tsx — estado global e regras de CRUD
  navigation/   # stack de telas (Listar, Detalhe, Formulário)
  screens/      # TodoListScreen, TodoDetailScreen, TodoFormScreen
  components/   # TodoItem, SearchBar, LoadingState, ErrorState, EmptyState
  utils/        # validation.ts
__tests__/      # testes unitários (Jest)
```

## Possíveis melhorias futuras

- Testes de componente com React Native Testing Library
- Animações de transição entre telas
- Debounce visual na busca (hoje já não gera chamadas à API, mas poderia
  suavizar a filtragem em listas muito grandes)
