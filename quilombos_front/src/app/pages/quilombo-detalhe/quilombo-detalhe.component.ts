import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuilomboService, Quilombo } from '../../services/quilombo.service';

@Component({
  selector: 'app-quilombo-detalhe',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quilombo-detalhe.component.html',
  styleUrls: ['./quilombo-detalhe.component.scss'],
})
export class QuilomboDetalheComponent implements OnInit {
  quilombo?: Quilombo;
  secoes: any[] = [];
  ativo: number | null = 0;
  carregando = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quilomboService: QuilomboService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.carregarDados(Number(id));
    } else {
      this.router.navigate(['/quilombos']);
    }
  }

  carregarDados(id: number) {
    this.carregando = true;
    this.quilomboService.getById(id).subscribe({
      next: (data) => {
        this.quilombo = data;
        this.secoes = [
          { titulo: 'História e Resistência', conteudo: data.historia },
          { titulo: 'Saberes e Fazeres', conteudo: data.cultura },
          { titulo: 'Terra e Pertencimento', conteudo: data.territorio },
        ];
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
        this.router.navigate(['/quilombos']);
      }
    });
  }

  toggle(i: number) {
    this.ativo = this.ativo === i ? null : i;
  }

  voltar() {
    this.router.navigate(['/quilombos']);
  }
}
