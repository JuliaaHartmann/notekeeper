import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideBookOpen } from '@lucide/angular';
import { ApiValidationProblemDetails } from '../../auth/auth.models';
import { NotaDto } from '../../notas/notas.models';
import { NotasService } from '../../notas/nota.service';
import { CategoriaDto } from '../categorias.models';
import { CategoriasService } from '../categoria.service';

@Component({
  imports: [RouterLink, LucideBookOpen, DatePipe],
  selector: 'app-detalhes-categoria',
  templateUrl: './detalhes-categoria.html',
})
export class DetalhesCategoria {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly categoriasService = inject(CategoriasService);
  private readonly notasService = inject(NotasService);
  private readonly categoriaId: string | null;

  protected readonly categoria = signal<CategoriaDto | null>(null);
  protected readonly carregando = signal(true);
  protected readonly mensagemErro = signal('');
  protected readonly confirmandoExclusao = signal(false);
  protected readonly excluindo = signal(false);
  protected readonly notas = signal<readonly NotaDto[]>([]);
  protected readonly carregandoNotas = signal(true);
  protected readonly mensagemErroNotas = signal('');

  constructor() {
    this.categoriaId = this.route.snapshot.paramMap.get('categoriaId');
    if (!this.categoriaId) {
      this.mensagemErro.set('Identificador da categoria inválida.');
      this.carregando.set(false);
      return;
    }

    this.categoriasService.obterPorId(this.categoriaId).subscribe({
      next: (categoria) => {
        this.categoria.set(categoria);
        this.carregando.set(false);
        if (this.categoriaId) this.carregarNotas(this.categoriaId);
      },
      error: (resposta: HttpErrorResponse) => {
        this.mensagemErro.set(this.obterMensagemErro(resposta));
        this.carregando.set(false);
      },
    });
  }

  protected abrirConfirmacao(): void {
    this.mensagemErro.set('');
    this.confirmandoExclusao.set(true);
  }
  protected cancelarExclusao(): void {
    if (this.excluindo()) return;
    this.confirmandoExclusao.set(false);
  }
  protected confirmarExclusao(): void {
    if (!this.categoriaId || this.excluindo()) return;
    this.excluindo.set(true);
    this.mensagemErro.set('');
    this.categoriasService.excluir(this.categoriaId).subscribe({
      next: () => {
        this.excluindo.set(false);
        void this.router.navigateByUrl('/categorias/listar');
      },
      error: (resposta: HttpErrorResponse) => {
        this.mensagemErro.set(this.obterMensagemErroExclusao(resposta));
        this.excluindo.set(false);
      },
    });
  }

  protected tentarCarregarNotas(): void {
    if (this.categoriaId) this.carregarNotas(this.categoriaId);
  }

  private carregarNotas(categoriaId: string): void {
    this.carregandoNotas.set(true);
    this.mensagemErroNotas.set('');
    this.notasService.listar([categoriaId]).subscribe({
      next: (notas) => {
        this.notas.set(notas);
        this.carregandoNotas.set(false);
      },
      error: (resposta: HttpErrorResponse) => {
        const problem = resposta.error as ApiValidationProblemDetails | null;
        this.mensagemErroNotas.set(
          problem?.detail ?? 'Não foi possível carregar as notas desta categoria.',
        );
        this.carregandoNotas.set(false);
      },
    });
  }

  private obterMensagemErroExclusao(resposta: HttpErrorResponse): string {
    const problem = resposta.error as ApiValidationProblemDetails | null;
    return problem?.detail ?? 'Não foi possível excluir a categoria. Tente novamente em instantes.';
  }

  private obterMensagemErro(resposta: HttpErrorResponse): string {
    const problem = resposta.error as ApiValidationProblemDetails | null;

    return (
      problem?.detail ?? 'Não foi possível carregar o categoria. Tente novamente em instantes.'
    );
  }
}
