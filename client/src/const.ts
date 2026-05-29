export const APP_TITLE = "SENAI - Controle de Máquinas";

export function getLoginUrl(returnPath?: string): string {
  // Redireciona para a página inicial se não houver caminho de retorno
  return returnPath ? `/login?return=${encodeURIComponent(returnPath)}` : "/";
}
