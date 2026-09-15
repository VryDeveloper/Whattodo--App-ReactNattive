import { createNavigationContainerRef } from "@react-navigation/native";
import { RootTabParamList } from "./types";

export const navigationRef = createNavigationContainerRef<RootTabParamList>();

/**
 * Navega para o detalhe de uma tarefa a partir de fora da árvore de
 * componentes (usado pelo listener de notificação). A tipagem completa de
 * navegação aninhada (tab -> stack) exigiria compor os param lists dos dois
 * navegadores; como este é o único caso de uso, optamos por um cast local
 * em vez de modelar isso para o app inteiro.
 */
export function navigateToTodoDetail(id: number) {
  if (!navigationRef.isReady()) return;
  navigationRef.navigate("TarefasTab", {
    screen: "TodoDetail",
    params: { id },
  } as never);
}
