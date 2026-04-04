import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { QuilomboService, Quilombo } from '../../services/quilombo.service';

@Component({
  selector: 'app-quilombos',
  templateUrl: './quilombos.component.html',
  standalone: true,
  imports: [CommonModule, RouterLink],
  styleUrls: ['./quilombos.component.scss'],
})
export class QuilombosComponent implements OnInit {
  quilombos: Quilombo[] = [];
  carregando = true;

  constructor(
    private router: Router,
    private quilomboService: QuilomboService
  ) {}

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando = true;
    this.quilomboService.getAll().subscribe({
      next: (data) => {
        this.quilombos = data;
        this.carregando = false;
      },
      error: () => this.carregando = false
    });
  }

  irPara(id: number) {
    this.router.navigate(['/quilombos', id]);
  }
}
