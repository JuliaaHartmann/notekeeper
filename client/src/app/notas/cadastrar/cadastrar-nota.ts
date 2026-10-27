import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { form, FormField, maxLength, minLength, pattern, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { ApiValidationProblemDetails } from '../../auth/auth.models';
import { CategoriaDto } from '../../categorias/categorias.models';
import { CategoriasService } from '../../categorias/categoria.service';
import { CriarNotaRequest } from '../notas.models';
import { NotasService } from '../nota.service';

interface NotaFormModel {
  readonly titulo: string;
  readonly descricao: string;
}

@Component({
  imports: [FormField],
  selector: 'app-cadastrar-nota',
  templateUrl: './cadastrar-nota.html',
})
export class CadastrarNota {
  private readonly categoriasService = inject(CategoriasService);
  private readonly notasService = inject(NotasService);
  private readonly router = inject(Router);

  protected readonly categorias = signal<readonly CategoriaDto[]>([]);
  protected readonly categoriasSelecionadas = signal<readonly string[]>([]);
  protected readonly carregandoCategorias = signal(true);
  protected readonly enviandoFormulario = signal(false);
  protected readonly mensagemErro = signal('');

  protected readonly modeloNota = signal<NotaFormModel>({
    titulo: '',
    descricao: '',
  });

  protected readonly formularioNota = form(this.modeloNota, (modelo) => {
    required(modelo.titulo, { message: 'Informe o título da nota.' });
    minLength(modelo.titulo, 2, { message: 'O título precisa ter pelo menos 2 caracteres.' });
    maxLength(modelo.titulo, 100, { message: 'O título pode ter no máximo 100 caracteres.' });
    pattern(modelo.titulo, /\S/, { message: 'O título não pode conter apenas espaços.' });
    maxLength(modelo.descricao, 300, {
      message: 'A descrição pode ter no máximo 300 caracteres.',
    });
  });

  constructor() {
    this.categoriasService.listar().subscribe({
      next: (categorias) => {
        this.categorias.set(categorias);
        this.carregandoCategorias.set(false);
      },
      error: (resposta: HttpErrorResponse) => {
        this.mensagemErro.set(this.obterMensagemErroApi(resposta));
        this.carregandoCategorias.set(false);
      },
    });
  }

  protected alternarCategoria(categoriaId: string, event: Event): void {
    const selecionada = (event.target as HTMLInputElement).checked;

    this.categoriasSelecionadas.update((ids) =>
      selecionada ? [...ids, categoriaId] : ids.filter((id) => id !== categoriaId),
    );
  }

  protected cadastrarNota(event: SubmitEvent): void {
    event.preventDefault();

    const formulario = this.formularioNota();
    if (formulario.invalid()) {
      formulario.markAsTouched();
      return;
    }

    const modelo = this.modeloNota();
    const request: CriarNotaRequest = {
      titulo: modelo.titulo.trim(),
      descricao: modelo.descricao.trim(),
      categoriaIds: [...this.categoriasSelecionadas()],
    };

    this.enviandoFormulario.set(true);
    this.mensagemErro.set('');

    this.notasService.cadastrar(request).subscribe({
      next: () => {
        this.enviandoFormulario.set(false);
        void this.router.navigateByUrl('/notas/listar');
      },
      error: (resposta: HttpErrorResponse) => {
        this.mensagemErro.set(this.obterMensagemErroApi(resposta));
        this.enviandoFormulario.set(false);
      },
    });
  }

  private obterMensagemErroApi(resposta: HttpErrorResponse): string {
    const problem = resposta.error as ApiValidationProblemDetails | null;

    if (problem?.errors) {
      const mensagens = Object.values(problem.errors).flat();
      if (mensagens.length > 0) return mensagens.join('\n');
    }

    return problem?.detail ?? 'Não foi possível cadastrar a nota. Tente novamente em instantes.';
  }
}