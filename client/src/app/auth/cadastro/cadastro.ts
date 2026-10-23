import { afterNextRender, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideArrowRight } from '@lucide/angular';
import { AuthShell } from '../shell/auth-shell';
import { email, form, FormField, minLength, pattern, required } from '@angular/forms/signals';
import { AuthService } from '../auth.service';
import { CadastroConcluidoNavigationState, CadastroRequest } from '../auth.models';

interface CadastroFormModel {
  readonly nome: string;
  readonly email: string;
  readonly senha: string;
}
@Component({
  imports: [LucideArrowRight, AuthShell, FormField, RouterLink],
  selector: 'app-cadastro',
  templateUrl: './cadastro.html',
})
export class Cadastro {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private readonly tituloPagina = viewChild<ElementRef<HTMLHeadingElement>>('tituloPagina');

  protected readonly modeloFormulario = signal<CadastroFormModel>({
    nome: '',
    email: '',
    senha: '',
  });

  protected readonly formularioCadastro = form(this.modeloFormulario, (modelo) => {
    required(modelo.nome, { message: 'Informe seu nome.' });
    pattern(modelo.nome, /\S/, {
      message: 'O nome não pode conter apenas espaços.',
    });
    required(modelo.email, { message: 'Informe seu e-mail.' });
    email(modelo.email, { message: 'Informe um e-mail válido.' });
    required(modelo.senha, { message: 'Informe sua senha.' });
    minLength(modelo.senha, 8, { message: 'A senha precisa ter pelo menos 8 caracteres.' });
    pattern(modelo.senha, /(?=.*\d)(?=.*[^a-zA-Z0-9]).+/, {
      message: 'Inclua pelo menos um número e um caractere especial.',
    });
  });

  constructor() {
    afterNextRender(() => this.tituloPagina()?.nativeElement.focus());
  }

  protected enviarFormulario(event: SubmitEvent) {
    event.preventDefault();

    if (this.formularioCadastro().invalid()) {
      this.formularioCadastro().markAsTouched();
      return;
    }

    const request: CadastroRequest = {
      nome: this.modeloFormulario().nome,
      email: this.modeloFormulario().email,
      senha: this.modeloFormulario().senha,
    };

    this.authService.cadastrar(request).subscribe((usuario) => {
      const estadoNavegacao: CadastroConcluidoNavigationState = {
        emailCadastrado: usuario.email,
      };

      void this.router.navigateByUrl('/login', { state: estadoNavegacao });
    });
  }
}
