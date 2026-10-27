import { CategoriaDto } from '../categorias/categorias.models';

export interface NotaDto {
  readonly id: string;
  readonly titulo: string;
  readonly descricao: string | null;
  readonly status: string;
  readonly categorias: readonly CategoriaDto[];
  readonly criadoEm: string;
  readonly atualizadoEm: string;
}

export interface CriarNotaRequest {
  readonly titulo: string;
  readonly descricao: string;
  readonly categoriaIds: readonly string[];
}

export interface AtualizarNotaRequest {
  readonly titulo: string;
  readonly descricao: string;
  readonly status: string;
  readonly categoriaIds: readonly string[];
}