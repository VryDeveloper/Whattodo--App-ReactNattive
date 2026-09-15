export const TITLE_MIN_LENGTH = 3;
export const TITLE_MAX_LENGTH = 100;

/**
 * Valida o título de uma tarefa segundo as regras do teste técnico:
 * obrigatório, mínimo de 3 e máximo de 100 caracteres.
 * Retorna a mensagem de erro ou null quando válido.
 */
export function validateTitle(title: string): string | null {
  const trimmed = title.trim();

  if (trimmed.length === 0) {
    return "O título é obrigatório.";
  }
  if (trimmed.length < TITLE_MIN_LENGTH) {
    return `O título deve ter no mínimo ${TITLE_MIN_LENGTH} caracteres.`;
  }
  if (trimmed.length > TITLE_MAX_LENGTH) {
    return `O título deve ter no máximo ${TITLE_MAX_LENGTH} caracteres.`;
  }
  return null;
}
