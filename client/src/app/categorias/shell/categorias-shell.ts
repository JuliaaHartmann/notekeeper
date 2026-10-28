import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LucideFolderOpen, LucideTag } from '@lucide/angular';

import { Navbar } from '../../shared/navbar/navbar';

@Component({
  imports: [RouterLinkActive, RouterLink, RouterOutlet, LucideFolderOpen, LucideTag, Navbar],
  selector: 'app-categorias-shell',
  templateUrl: './categorias-shell.html',
})
export class CategoriasShell {}
