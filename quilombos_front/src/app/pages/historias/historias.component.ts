import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuilomboService, Quilombo } from '../../services/quilombo.service';

@Component({
  selector: 'app-historias',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historias.component.html',
  styleUrls: ['./historias.component.scss'],
})
export class HistoriasComponent implements OnInit {
  quilombos: Quilombo[] = [];
  quilomboAtivo?: number;

  constructor(private quilomboService: QuilomboService) {}

  ngOnInit(): void {
    this.quilomboService.getAll().subscribe((data) => {
      this.quilombos = data;
      if (this.quilombos.length > 0) {
        this.quilomboAtivo = this.quilombos[0].id;
      }
    });
  }

  get quilomboSelecionado() {
    return this.quilombos.find((q) => q.id === this.quilomboAtivo);
  }

  selecionar(id: number) {
    this.quilomboAtivo = id;
  }
}
