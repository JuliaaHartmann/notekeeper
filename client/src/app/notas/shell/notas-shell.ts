import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LucideNotebookPen } from '@lucide/angular';
import { Navbar } from '../../shared/navbar/navbar';

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet, LucideNotebookPen, Navbar],
  selector: 'app-notas-shell',
  templateUrl: './notas-shell.html',
})
export class NotasShell {}