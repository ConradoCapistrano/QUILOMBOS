import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contato',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contato.component.html',
  styleUrls: ['./contato.component.scss'],
})
export class ContatoComponent {
  contatos = [
    {
      titulo: 'Localização',
      valor: 'IFPE, Vitória de Santo Antão - PE',
      icone: 'bi-geo-alt',
      link: 'https://maps.google.com',
    },
    {
      titulo: 'Telefone',
      valor: '(81) 99999-9999',
      icone: 'bi-telephone',
      link: 'tel:81999999999',
    },
    {
      titulo: 'Email',
      valor: 'ana.falcao@vitoria.ifpe.edu.br',
      icone: 'bi-envelope',
      link: 'mailto:ana.falcao@vitoria.ifpe.edu.br',
    },
  ];
}
