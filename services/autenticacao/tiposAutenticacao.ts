import type {PapelUsuario,RespostaAutenticacao} from '@viva/contracts';
export interface SessaoAplicativo {
 tokenAcesso:string;
 expiraEm:string;
 usuario:{id:string;email:string;nomeExibicao:string;papel:PapelUsuario;idUnidade:string};
}
/** A fronteira mantém os campos JSON do contrato anterior; o aplicativo usa domínio em português. */
export function converterRespostaAutenticacao(resposta:RespostaAutenticacao):SessaoAplicativo{return {tokenAcesso:resposta.accessToken,expiraEm:resposta.expiresAt,usuario:{id:resposta.user.id,email:resposta.user.email,nomeExibicao:resposta.user.displayName,papel:resposta.user.role,idUnidade:resposta.user.organizationId}};}
