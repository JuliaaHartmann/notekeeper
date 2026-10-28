import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { LucideFileText, LucideTags } from '@lucide/angular';

@Component({
  imports: [LucideFileText, LucideTags, RouterLink, RouterLinkActive],
  selector: 'app-navbar',
  // styleUrl: './navbar.css',
  templateUrl: './navbar.html',
})
export class Navbar {
  protected readonly authService = inject(AuthService);
  protected readonly sessaoAutenticada = this.authService.sessao;
}
