import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideLightbulb, LucideNotebookPen } from '@lucide/angular';

@Component({
  imports: [LucideLightbulb, LucideNotebookPen, RouterLink],
  selector: 'app-auth-shell',
  templateUrl: './auth-shell.html',
})
export class AuthShell {}
