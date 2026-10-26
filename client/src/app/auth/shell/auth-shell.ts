import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { LucideLightbulb, LucideNotebookPen } from '@lucide/angular';

@Component({
  imports: [LucideNotebookPen, LucideLightbulb, RouterLink, RouterOutlet],
  selector: 'app-auth-shell',
  templateUrl: './auth-shell.html',
})
export class AuthShell {}
