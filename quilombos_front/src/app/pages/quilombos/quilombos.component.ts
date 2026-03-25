import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-quilombos',
  templateUrl: './quilombos.component.html',
  imports: [CommonModule],
  styleUrls: ['./quilombos.component.scss'],
})
export class QuilombosComponent {
  constructor(private router: Router) {}

  quilombos = [
    {
      nome: 'Riacho dos Porcos',
      descricao:
        'Comunidade marcada pela resistência e preservação cultural no sertão.',
      imagem: 'assets/riacho.png',
      rota: '/quilombos/riacho',
    },
    {
      nome: 'Severo',
      descricao:
        'História de luta e identidade construída ao longo de gerações.',
      imagem: 'assets/severo.png',
      rota: '/quilombos/severo',
    },
    {
      nome: 'Buenos Aires',
      descricao: 'Tradições vivas e conexão forte com suas raízes ancestrais.',
      imagem: 'assets/bueno.png',
      rota: '/quilombos/buenos',
    },
  ];

  irPara(rota: string) {
    this.router.navigate([rota]);
  }
}
