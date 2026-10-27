import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiValidationProblemDetails } from '../../auth/auth.models';
import { CategoriaDto } from '../../categorias/categorias.models';
import { CategoriasService } from '../../categorias/categoria.service';
import { NotaDto } from '../notas.models';
import { NotasService } from '../nota.service';

@Component({
  imports: [DatePipe, RouterLink],
  selector: 'app-listar-notas',
  templateUrl: './listar-notas.html',
})
export class ListarNotas {
  private readonly categoriasService = inject(CategoriasService);
  private readonly notasService = inject(NotasService);

  protected readonly notas = signal<readonly NotaDto[]>([]);
  protected readonly categorias = signal<readonly CategoriaDto[]>([]);
  protected readonly categoriasSelecionadas = signal<readonly string[]>([]);
  protected readonly carregando = signal(true);
  protected readonly carregandoCategorias = signal(true);
  protected readonly falhaCarregamento = signal(false);
  protected readonly mensagemErro = signal('');
  protected readonly mensagemErroCategorias = signal('');
  protected readonly exclusaoPendenteId = signal<string | null>(null);
  protected readonly excluindoId = signal<string | null>(null);

  constructor() {
    this.carregarCategorias();
    this.carregarNotas();
  }

  protected alternarCategoria(categoriaId: string, event: Event): void {
    const selecionada = (event.target as HTMLInputElement).checked;
    this.categoriasSelecionadas.update((ids) =>
      selecionada ? [...ids, categoriaId] : ids.filter((id) => id !== categoriaId),
    );
    this.carregarNotas();
  }

  protected limparFiltros(): void {
    this.categoriasSelecionadas.set([]);
    this.carregarNotas();
  }

  protected tentarCarregarNovamente(): void {
    this.carregarNotas();
  }

  protected abrirConfirmacao(notaId: string): void {
    this.mensagemErro.set('');
    this.exclusaoPendenteId.set(notaId);
  }

  protected cancelarExclusao(): void {
    if (this.excluindoId()) return;
    this.exclusaoPendenteId.set(null);
  }

  protected confirmarExclusao(notaId: string): void {
    if (this.excluindoId()) return;
    this.excluindoId.set(notaId);
    this.mensagemErro.set('');
    this.notasService.excluir(notaId).subscribe({
      next: () => {
        this.excluindoId.set(null);
        this.exclusaoPendenteId.set(null);
        this.carregarNotas();
      },
      error: (resposta: HttpErrorResponse) => {
        this.mensagemErro.set(this.obterMensagemErro(resposta));
        this.excluindoId.set(null);
      },
    });
  }

  private carregarCategorias(): void {
    this.categoriasService.listar().subscribe({
      next: (categorias) => {
        this.categorias.set(categorias);
        this.carregandoCategorias.set(false);
      },
      error: (resposta: HttpErrorResponse) => {
        this.mensagemErroCategorias.set(this.obterMensagemErro(resposta));
        this.carregandoCategorias.set(false);
      },
    });
  }

  private carregarNotas(): void {
    this.carregando.set(true);
    this.falhaCarregamento.set(false);
    this.mensagemErro.set('');
    this.notasService.listar(this.categoriasSelecionadas()).subscribe({
      next: (notas) => {
        this.notas.set(notas);
        this.carregando.set(false);
      },
      error: (resposta: HttpErrorResponse) => {
        this.mensagemErro.set(this.obterMensagemErro(resposta));
        this.falhaCarregamento.set(true);
        this.carregando.set(false);
      },
    });
  }

  private obterMensagemErro(resposta: HttpErrorResponse): string {
    const problem = resposta.error as ApiValidationProblemDetails | null;
    return problem?.detail ?? 'Não foi possível carregar as notas. Tente novamente em instantes.';
  }
}