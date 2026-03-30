import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  PostagensService,
  PostagemDetalheDto,
  ComentarioDto,
} from '../../../services/api.service';
import { ComentariosService } from '../../../services/api.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-postagem-detalhe',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './postagem-detalhe.component.html',
  styleUrls: ['./postagem-detalhe.component.scss'],
})
export class PostagemDetalheComponent implements OnInit, OnDestroy {
  postagem?: PostagemDetalheDto;
  carregando = true;
  erro = false;

  nomeComentario = '';
  textoComentario = '';
  enviandoComentario = false;
  comentarioEnviado = false;
  erroComentario = '';
  captchaResolved = false;
  captchaToken = '';

  imagemAberta?: string;
  imagemAtualIndex = 0;
  isBrowser: boolean;
  hcaptchaSiteKey = environment.hcaptchaSiteKey;

  // Estado do menu de compartilhamento
  shareMenuOpen = false;

  constructor(
    private route: ActivatedRoute,
    private postagensService: PostagensService,
    private comentariosService: ComentariosService,
    private sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent) {
    if (!this.imagemAberta) return;

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.imagemAnterior();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.proximaImagem();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.fecharImagem();
    }
  }

  // Fechar menu ao clicar fora
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.share-dropdown')) {
      this.shareMenuOpen = false;
    }
  }

  ngOnInit(): void {
    this.loadPostagem();
  }

  ngOnDestroy(): void {
    if (this.isBrowser && this.imagemAberta) {
      document.body.style.overflow = '';
    }
  }

  loadPostagem(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (isNaN(id) || id <= 0) {
      this.erro = true;
      this.carregando = false;
      return;
    }

    this.postagensService.getById(id).subscribe({
      next: (p: PostagemDetalheDto) => {
        this.postagem = p;
        this.carregando = false;
        if (this.isBrowser) {
          this.injectHCaptcha();
        }
      },
      error: () => {
        this.erro = true;
        this.carregando = false;
      },
    });
  }

  get blocoTexto(): Array<{ tipo: 'texto' | 'youtube'; conteudo: string }> {
    if (!this.postagem?.texto) return [];

    const youtubeRegex =
      /https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)[^\s]*/g;
    const paragrafos = this.postagem.texto.split('\n').filter((l) => l.trim());

    return paragrafos.map((p) => {
      const match = youtubeRegex.exec(p);
      youtubeRegex.lastIndex = 0;
      if (match) return { tipo: 'youtube' as const, conteudo: match[1] };
      return { tipo: 'texto' as const, conteudo: p };
    });
  }

  youtubeUrl(videoId: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${videoId}`,
    );
  }

  abrirImagem(url: string, index: number): void {
    this.imagemAberta = url;
    this.imagemAtualIndex = index;
    if (this.isBrowser) {
      document.body.style.overflow = 'hidden';
    }
  }

  fecharImagem(): void {
    this.imagemAberta = undefined;
    if (this.isBrowser) {
      document.body.style.overflow = '';
    }
  }

  imagemAnterior(): void {
    if (!this.postagem?.imagens.length) return;
    this.imagemAtualIndex =
      (this.imagemAtualIndex - 1 + this.postagem.imagens.length) %
      this.postagem.imagens.length;
    this.imagemAberta = this.postagem.imagens[this.imagemAtualIndex].url;
  }

  proximaImagem(): void {
    if (!this.postagem?.imagens.length) return;
    this.imagemAtualIndex =
      (this.imagemAtualIndex + 1) % this.postagem.imagens.length;
    this.imagemAberta = this.postagem.imagens[this.imagemAtualIndex].url;
  }

  formatarData(iso: string): string {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatarDataRelativa(iso: string): string {
    if (!iso) return '';

    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'agora';
    if (diffMins < 60) return `${diffMins}min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}sem`;

    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  }

  getAvatarColor(nome: string): string {
    const colors = ['#c9882a', '#b07620', '#9e6b2c', '#8b5a2a', '#7a4f2a'];
    return colors[nome.length % colors.length];
  }

  getTempoLeitura(): number {
    if (!this.postagem?.texto) return 1;
    const palavras = this.postagem.texto.split(/\s+/).length;
    const minutos = Math.ceil(palavras / 200);
    return Math.max(1, minutos);
  }

  toggleShareMenu() {
    this.shareMenuOpen = !this.shareMenuOpen;
  }

  curtirPost() {
    console.log('Curtiu o post');
  }

  shareToWhatsApp() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(this.postagem?.titulo || '');
    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
    this.shareMenuOpen = false;
  }

  shareToFacebook() {
    const url = encodeURIComponent(window.location.href);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      '_blank',
      'width=600,height=400',
    );
    this.shareMenuOpen = false;
  }

  shareToTwitter() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(this.postagem?.titulo || '');
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      '_blank',
      'width=600,height=400',
    );
    this.shareMenuOpen = false;
  }

  copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert('Link copiado!');
    });
    this.shareMenuOpen = false;
  }

  compartilharPost(): void {
    if (!this.postagem) return;

    const url = window.location.href;
    if (navigator.share) {
      navigator
        .share({
          title: this.postagem.titulo,
          text: this.postagem.subtitulo || '',
          url: url,
        })
        .catch(console.error);
    } else {
      navigator.clipboard.writeText(url).then(() => {
        alert('Link copiado!');
      });
    }
  }

  private injectHCaptcha(): void {
    if (!this.isBrowser || document.getElementById('hcaptcha-script')) return;

    const script = document.createElement('script');
    script.id = 'hcaptcha-script';
    script.src = 'https://js.hcaptcha.com/1/api.js';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    (window as any).onCaptchaSuccess = (token: string) => {
      this.captchaToken = token;
      this.captchaResolved = true;
      this.erroComentario = '';
    };

    (window as any).onCaptchaExpire = () => {
      this.captchaToken = '';
      this.captchaResolved = false;
    };
  }

  enviarComentario(): void {
    if (!this.postagem) return;

    if (!this.nomeComentario.trim()) {
      this.erroComentario = 'Digite seu nome';
      return;
    }

    if (!this.textoComentario.trim()) {
      this.erroComentario = 'Digite seu comentário';
      return;
    }

    if (!this.captchaResolved) {
      this.erroComentario = 'Complete o captcha';
      return;
    }

    this.enviandoComentario = true;
    this.erroComentario = '';

    this.comentariosService
      .criar(
        this.postagem.id,
        this.nomeComentario.trim(),
        this.textoComentario.trim(),
        this.captchaToken,
      )
      .subscribe({
        next: (c: ComentarioDto) => {
          this.postagem!.comentarios.unshift(c);
          this.nomeComentario = '';
          this.textoComentario = '';
          this.captchaResolved = false;
          this.captchaToken = '';
          this.comentarioEnviado = true;
          this.enviandoComentario = false;

          if (this.isBrowser && (window as any).hcaptcha) {
            (window as any).hcaptcha.reset();
          }

          setTimeout(() => (this.comentarioEnviado = false), 3000);
        },
        error: (err: any) => {
          this.erroComentario = err?.error?.message || 'Erro ao enviar';
          this.enviandoComentario = false;
          if (this.isBrowser && (window as any).hcaptcha) {
            (window as any).hcaptcha.reset();
          }
          this.captchaResolved = false;
          this.captchaToken = '';
        },
      });
  }
}
