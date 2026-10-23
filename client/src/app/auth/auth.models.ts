export interface CadastroRequest {
  readonly nome: string;
  readonly email: string;
  readonly senha: string;
}

export interface CadastroConcluidoNavigationState {
  readonly emailCadastrado?: string;
}

export interface UsuarioDto {
  readonly id: string;
  readonly nome: string;
  readonly email: string;
}
