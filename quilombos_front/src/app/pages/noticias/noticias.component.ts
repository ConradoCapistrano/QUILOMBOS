import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PostagensService, PostagemResumoDto, PostagemResumoDto as PR } from '../../services/api.service';
import { QuilombosService, QuilomboDto } from '../../services/api.service';

@Component({
  selector: 'app-noticias',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './noticias.component.html',
  styleUrls: ['./noticias.component.scss']
})
export class NoticiasComponent implements OnInit {
  quilombos: QuilomboDto[] = [];
  postagens: PostagemResumoDto[] = [];
  total = 0;
  page = 1;
  pageSize = 9;
  quilomboFiltro?: number;
  carregando = true;

  constructor(
    private postagensService: PostagensService,
    private quilombosService: QuilombosService
  ) {}

  ngOnInit(): void {
    this.quilombosService.listar().subscribe((q: import('../../services/api.service').QuilomboDto[]) => this.quilombos = q);
    this.carregar();
  }

  carregar(reset = false): void {
    if (reset) this.page = 1;
    this.carregando = true;
    this.postagensService.listar(this.quilomboFiltro, this.page, this.pageSize).subscribe({
      next: (res: import('../../services/api.service').PostagensResponse) => {
        this.postagens = res.data;
        this.total = res.total;
        this.carregando = false;
      },
      error: () => this.carregando = false
    });
  }

  filtrarPorQuilombo(id?: number): void {
    this.quilomboFiltro = id;
    this.carregar(true);
  }

  get totalPages(): number {
    return Math.ceil(this.total / this.pageSize);
  }

  irParaPagina(p: number): void {
    this.page = p;
    this.carregar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  formatarData(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  }
}
