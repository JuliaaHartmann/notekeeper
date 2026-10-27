import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { form, FormField, maxLength, minLength, pattern, required } from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiValidationProblemDetails } from '../../auth/auth.models';
import { CategoriaDto } from '../../categorias/categorias.models';
import { CategoriasService } from '../../categorias/categoria.service';
import { AtualizarNotaRequest, NotaDto } from '../notas.models';
import { NotasService } from '../nota.service';

interface NotaFormModel {
  readonly titulo: string;
  readonly descricao: string;
  readonly status: string;
}

@Component({
  imports: [FormField, RouterLink],
  selector: 'app-editar-nota',
  templateUrl: './editar-nota.html',
})
export class EditarNota {
  private readonly notasService = inject(NotasService);
  private readonly categoriasService = inject(CategoriasService);
  private readonly router = inject(Router);
  private readonly notaId = inject(ActivatedRoute).snapshot.paramMap.get('notaId');

  protected readonly carregando = signal(true);
  protected readonly categorias = signal<readonly CategoriaDto[]>([]);
  protected readonly categoriasSelecionadas = signal<readonly string[]>([]);
  protected readonly modeloNota = signal<NotaFormModel>({ titulo: '', descricao: '', status: 'Ativa' });
  protected readonly formularioNota = form(this.modeloNota, (modelo) => {
    required(modelo.titulo, { message: 'Informe o título da nota.' });
    minLength(modelo.titulo, 2, { message: 'O título precisa ter pelo menos 2 caracteres.' });
    maxLength(modelo.titulo, 100, { message: 'O título pode ter no máximo 100 caracteres.' });
    pattern(modelo.titulo, /\S/, { message: 'O título não pode conter apenas espaços.' });
    maxLength(modelo.descricao, 300, {
      message: 'A descrição pode ter no máximo 300 caracteres.',
    });
    required(modelo.status, { message: 'Selecione o status da nota.' });
  });
  protected readonly carregandoCategorias = signal(true);
  protected readonly enviandoFormulario = signal(false);
  protected readonly mensagemErro = signal('');
  protected readonly formularioVisivel = signal(false);

  constructor() {
    if (!this.notaId) {
      this.mensagemErro.set('Identificador da nota inválido.');
      this.carregando.set(false);
      return;
    }

    this.carregarCategorias();
    this.notasService.obterPorId(this.notaId).subscribe({
      next: (nota) => this.preencherFormulario(nota),
      error: (resposta: HttpErrorResponse) => {
        this.mensagemErro.set(this.obterMensagemErro(resposta));
        this.carregando.set(false);
      },
    });
  }

  protected alternarCategoria(categoriaId: string, event: Event): void {
    const selecionada = (event.target as HTMLInputElement).checked;
    this.categoriasSelecionadas.update((ids) =>
      selecionada ? [...ids, categoriaId] : ids.filter((id) => id !== categoriaId),
    );
  }

  protected atualizarNota(event: SubmitEvent): void {
    event.preventDefault();
    if (!this.notaId) return;

    const formulario = this.formularioNota();
    if (formulario.invalid()) {
      formulario.markAsTouched();
      return;
    }

    const modelo = this.modeloNota();
    const request: AtualizarNotaRequest = {
      titulo: modelo.titulo.trim(),
      descricao: modelo.descricao.trim(),
      status: modelo.status,
      categoriaIds: [...this.categoriasSelecionadas()],
    };

    this.enviandoFormulario.set(true);
    this.mensagemErro.set('');
    this.notasService.atualizar(this.notaId, request).subscribe({
      next: () => {
        this.enviandoFormulario.set(false);
        void this.router.navigate(['/notas/detalhes', this.notaId]);
      },
      error: (resposta: HttpErrorResponse) => {
        this.mensagemErro.set(this.obterMensagemErro(resposta));
        this.enviandoFormulario.set(false);
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
        this.mensagemErro.set(this.obterMensagemErro(resposta));
        this.carregandoCategorias.set(false);
      },
    });
  }

  private preencherFormulario(nota: NotaDto): void {
    this.modeloNota.set({
      titulo: nota.titulo,
      descricao: nota.descricao ?? '',
      status: nota.status,
    });
    this.categoriasSelecionadas.set(nota.categorias.map((categoria) => categoria.id));
    this.formularioVisivel.set(true);
    this.carregando.set(false);
  }

  private obterMensagemErro(resposta: HttpErrorResponse): string {
    const problem = resposta.error as ApiValidationProblemDetails | null;
    if (problem?.errors) {
      const mensagens = Object.values(problem.errors).flat();
      if (mensagens.length > 0) return mensagens.join('\n');
    }
    return problem?.detail ?? 'Não foi possível atualizar a nota. Tente novamente em instantes.';
  }
}