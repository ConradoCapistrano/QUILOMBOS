import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-quilombo-detalhe',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quilombo-detalhe.component.html',
  styleUrls: ['./quilombo-detalhe.component.scss'],
})
export class QuilomboDetalheComponent {
  quilombo: any;
  secoes: any[] = [];
  ativo: number | null = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {
    const id = this.route.snapshot.paramMap.get('id');
    this.carregarDados(id);
  }

  carregarDados(id: string | null) {
    const dados: any = {
      riacho: {
        nome: 'Riacho dos Porcos',
        imagem: 'assets/riacho.png',
        historia: `
O Quilombo Riacho dos Porcos, em Sertânia, Pernambuco, é um território de resistência que pulsa desde os tempos da escravidão.
Aqui, a terra foi conquistada com suor e sangue, e cada palmo de chão conta histórias de liberdade.
Os mais velhos ainda lembram dos causos contados ao pé do fogo, histórias que atravessaram gerações sem precisar de papel.
É da oralidade que nasce a força dessa comunidade, que mantém viva a memória dos que vieram antes e abre caminhos para os que virão.
`,
        cultura: `
A cultura aqui é vivida no dia a dia. É na roda de conversa, na farinhada, na festa de santo, na benzeção que a vizinha faz.
É no saber de parteira, no conhecimento das ervas, na reza que acalma e no trabalho coletivo da roça.
A música é memória, o tambor ecoa, e a culinária traz o gosto do milho, da mandioca e do feijão plantado com as próprias mãos.
A ancestralidade não é lembrança, é presença viva que guia os passos de quem anda por essas terras.
`,
        territorio: `
O território não é só chão. É identidade, é pertencimento, é a certeza de que aqui se pode ser quem se é.
É o lugar onde os pés se firmam e onde os sonhos se plantam.
É onde o trabalho coletivo transforma a terra em sustento e a luta em esperança.
Defender esse território é defender a memória dos que vieram antes e o futuro dos que virão depois. É resistir com as mãos na terra e o coração na história.
`,
      },

      severo: {
        nome: 'Severo',
        imagem: 'assets/severo.png',
        historia: `
Severo é nome de gente, mas também é nome de lugar. É comunidade que carrega no nome a força de quem não se curvou.
Formada nos tempos do cativeiro, essa terra foi refúgio de quem buscou liberdade e se tornou lar de quem nela se enraizou.
As histórias se misturam: do tempo do engenho, da fuga, da fundação do quilombo, da luta pela terra que nunca terminou.
A memória de Severo é memória de luta, mas também de fé, de festa e de muita mandinga.
`,
        cultura: `
A cultura em Severo se aprende desde cedo. É no respeito aos mais velhos, nas histórias de assombração contadas à noite, no benzimento que cura, no trabalho da roça que alimenta corpo e alma.
As tradições se renovam a cada geração, sem perder o fio que conecta o presente ao passado.
O som do tambor, o cheiro do fumo de corda, o sabor da rapadura feita no engenho: tudo isso é cultura, é identidade, é quilombo.
`,
        territorio: `
O território de Severo é um corpo vivo. Cada grota, cada serra, cada nascente tem nome e história.
É onde as famílias constroem suas casas, plantam seus roçados e criam seus filhos.
É onde a comunidade se reúne para decidir os rumos, para celebrar e para resistir.
Sem terra não tem quilombo. Em Severo, essa lição está gravada na alma de cada morador.
`,
      },

      buenos: {
        nome: 'Buenos Aires',
        imagem: 'assets/bueno.png',
        historia: `
Buenos Aires, em Custódia, é um quilombo que respira diversidade. Aqui, mais de 250 famílias tecem uma história de resistência que mistura origens e saberes.
Diferente de outros quilombos, Buenos Aires cresceu na confluência de culturas, sem nunca perder sua raiz negra.
A terra foi conquistada a duras penas, em processos de luta que marcaram gerações.
Hoje, a comunidade carrega no peito a certeza de que seu lugar é aqui, onde a história se faz coletivamente.
`,
        cultura: `
A cultura de Buenos Aires é plural como sua gente. Tem o forró, tem o coco, tem a reza, tem o trabalho.
É na feira, na casa de farinha, nas rodas de conversa que a cultura se reinventa.
Os saberes populares são guardados com orgulho: o manejo da terra, o cuidado com os animais, o preparo dos alimentos.
Aqui, ser quilombola é uma identidade assumida com orgulho, celebrada em cada gesto do cotidiano.
`,
        territorio: `
O território de Buenos Aires é espaço de encontro. É onde diferentes famílias constroem suas vidas em comum.
É terra de criação, de plantio, de partilha.
É onde a natureza e a comunidade se entrelaçam, formando um lugar único no sertão pernambucano.
A defesa desse território é a defesa de um modo de vida, de uma história que não pode se perder.
`,
      },
    };

    this.quilombo = dados[id!];

    if (!this.quilombo) {
      this.router.navigate(['/quilombos']);
      return;
    }

    this.secoes = [
      { titulo: 'História e Resistência', conteudo: this.quilombo.historia },
      { titulo: 'Saberes e Fazeres', conteudo: this.quilombo.cultura },
      { titulo: 'Terra e Pertencimento', conteudo: this.quilombo.territorio },
    ];
  }

  toggle(i: number) {
    this.ativo = this.ativo === i ? null : i;
  }

  voltar() {
    this.router.navigate(['/quilombos']);
  }
}
