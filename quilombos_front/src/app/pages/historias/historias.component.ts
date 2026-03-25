import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type Quilombo = {
  id: string;
  nome: string;
  descricao: string;
  regiao?: string;
  municipio?: string;
  ano?: string;
  familias?: string;
};

@Component({
  selector: 'app-historias',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historias.component.html',
  styleUrls: ['./historias.component.scss'],
})
export class HistoriasComponent {
  quilombos: Quilombo[] = [
    {
      id: 'riacho',
      nome: 'Riacho dos Porcos',
      regiao: 'Pernambuco',
      municipio: 'Sertânia',
      ano: 'Origem no século XIX',
      familias: 'Aproximadamente 40 a 50 famílias',
      descricao: `A comunidade quilombola Riacho dos Porcos, localizada no município
    de Sertânia, no sertão de Pernambuco, tem origem ligada à formação de refúgios
    de pessoas negras que resistiram ao período escravocrata no século XIX.
    A comunidade preserva práticas tradicionais como a agricultura de subsistência,
    com destaque para o cultivo de milho, feijão e mandioca. Além disso, mantém
    viva a memória de seus antepassados por meio da oralidade, fortalecendo a
    identidade coletiva e os laços comunitários. O território é também espaço de
    resistência cultural e luta pelo reconhecimento de direitos territoriais.`,
    },
    {
      id: 'severo',
      nome: 'Severo',
      regiao: 'Pernambuco',
      municipio: 'Sertânia',
      ano: 'Século XIX (formação tradicional)',
      familias: 'Cerca de 30 famílias',
      descricao: `O Quilombo Severo é uma comunidade tradicional situada em Sertânia,
    Pernambuco, marcada pela forte preservação de saberes ancestrais. Sua formação
    remonta ao período pós-escravidão, quando famílias negras se estabeleceram na
    região em busca de autonomia e liberdade. A comunidade se destaca pela prática
    da agricultura familiar e pelo uso de conhecimentos tradicionais, como o cultivo
    de plantas medicinais e técnicas de manejo da terra adaptadas ao semiárido.
    As manifestações culturais, como festas religiosas e celebrações comunitárias,
    reforçam a identidade quilombola e a continuidade de suas tradições.`,
    },
    {
      id: 'buenos',
      nome: 'Buenos Aires',
      regiao: 'Pernambuco',
      municipio: 'Custódia',
      ano: 'Origem no século XIX',
      familias: 'Cerca de 50 a 60 famílias',
      descricao: `A comunidade quilombola Buenos Aires, localizada no município de
    Custódia, Pernambuco, é um importante exemplo de resistência e preservação da
    cultura afro-brasileira no sertão. Formada por descendentes de pessoas negras
    que buscaram refúgio durante e após o período escravocrata, a comunidade mantém
    tradições culturais por meio da culinária típica, do artesanato e das práticas
    religiosas. A economia local é baseada na agricultura familiar e na criação de
    pequenos animais. A transmissão de conhecimentos entre gerações fortalece a
    identidade da comunidade e sua luta pelo reconhecimento e pela valorização de
    seu território.`,
    },
  ];

  quilomboAtivo: Quilombo['id'] = 'riacho';

  get quilomboSelecionado() {
    return this.quilombos.find((q) => q.id === this.quilomboAtivo);
  }

  selecionar(id: Quilombo['id']) {
    this.quilomboAtivo = id;
  }
}
