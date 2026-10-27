import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiValidationProblemDetails } from '../../auth/auth.models';
import { NotaDto } from '../notas.models';
import { NotasService } from '../nota.service';

@Component({
  imports: [DatePipe, RouterLink],
  selector: 'app-detalhes-nota',
  templateUrl: './detalhes-nota.html',
})
export class DetalhesNota {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notasService = inject(NotasService);
  private readonly notaId = this.route.snapshot.paramMap.get('notaId');

  protected readonly nota = signal<NotaDto | null>(null);
  protected readonly carregando = signal(true);
  protected readonly mensagemErro = signal('');
  protected readonly confirmandoExclusao = signal(false);
  protected readonly excluindo = signal(false);

  constructor() {
    if (!this.notaId) {
      this.mensagemErro.set('Identificador da nota inválido.');
      this.carregando.set(false);
      return;
    }

    this.notasService.obterPorId(this.notaId).subscribe({
      next: (nota) => {
        this.nota.set(nota);
        this.carregando.set(false);
      },
      error: (resposta: HttpErrorResponse) => {
        this.mensagemErro.set(this.obterMensagemErro(resposta));
        this.carregando.set(false);
      },
    });
  }

  protected confirmarExclusao(): void {
    if (!this.notaId || this.excluindo()) return;
    this.excluindo.set(true);
    this.mensagemErro.set('');
    this.notasService.excluir(this.notaId).subscribe({
      next: () => {
        void this.router.navigateByUrl('/notas/listar');
      },
      error: (resposta: HttpErrorResponse) => {
        this.mensagemErro.set(this.obterMensagemErro(resposta));
        this.excluindo.set(false);
      },
    });
  }

  private obterMensagemErro(resposta: HttpErrorResponse): string {
    const problem = resposta.error as ApiValidationProblemDetails | null;
    return problem?.detail ?? 'Não foi possível carregar a nota. Tente novamente em instantes.';
  }
}