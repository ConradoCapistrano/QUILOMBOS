import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PostagensService, PostagemDetalheDto, ComentarioDto } from '../../../services/api.service';
import { ComentariosService } from '../../../services/api.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-postagem-detalhe',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './postagem-detalhe.component.html',
  styleUrls: ['./postagem-detalhe.component.scss']
})
export class PostagemDetalheComponent implements OnInit {
  postagem?: PostagemDetalheDto;
  carregando = true;
  erro = false;

  // Comments form
  nomeComentario = '';
  textoComentario = '';
  enviandoComentario = false;
  comentarioEnviado = false;
  erroComentario = '';
  captchaResolved = false;
  captchaToken = '';

  // Image lightbox
  imagemAberta?: string;
  imagemAtualIndex = 0;

  // hCaptcha
  hcaptchaSiteKey = environment.hcaptchaSiteKey;

  constructor(
    private route: ActivatedRoute,
    private postagensService: PostagensService,
    private comentariosService: ComentariosService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.postagensService.getById(id).subscribe({
      next: (p: import('../../../services/api.service').PostagemDetalheDto) => { this.postagem = p; this.carregando = false; this.injectHCaptcha(); },
      error: () => { this.erro = true; this.carregando = false; }
    });
  }

  // Split text into paragraphs, extracting YouTube URLs
  get blocoTexto(): Array<{ tipo: 'texto' | 'youtube'; conteudo: string }> {
    if (!this.postagem) return [];
    const youtubeRegex = /https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)[^\s]*/g;
    const paragrafos = this.postagem.texto.split('\n').filter((l: string) => l.trim());
    return paragrafos.map((p: string) => {
      const match = youtubeRegex.exec(p);
      youtubeRegex.lastIndex = 0;
      if (match) return { tipo: 'youtube' as const, conteudo: match[1] };
      return { tipo: 'texto' as const, conteudo: p };
    });
  }

  youtubeUrl(videoId: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}`);
  }

  abrirImagem(url: string, index: number): void {
    this.imagemAberta = url;
    this.imagemAtualIndex = index;
  }

  fecharImagem(): void { this.imagemAberta = undefined; }

  imagemAnterior(): void {
    if (!this.postagem) return;
    this.imagemAtualIndex = (this.imagemAtualIndex - 1 + this.postagem.imagens.length) % this.postagem.imagens.length;
    this.imagemAberta = this.postagem.imagens[this.imagemAtualIndex].url;
  }

  proximaImagem(): void {
    if (!this.postagem) return;
    this.imagemAtualIndex = (this.imagemAtualIndex + 1) % this.postagem.imagens.length;
    this.imagemAberta = this.postagem.imagens[this.imagemAtualIndex].url;
  }

  formatarData(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  // hCaptcha integration
  private injectHCaptcha(): void {
    if (document.getElementById('hcaptcha-script')) return;
    const script = document.createElement('script');
    script.id = 'hcaptcha-script';
    script.src = 'https://js.hcaptcha.com/1/api.js';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    (window as any).onCaptchaSuccess = (token: string) => {
      this.captchaToken = token;
      this.captchaResolved = true;
    };
    (window as any).onCaptchaExpire = () => {
      this.captchaToken = '';
      this.captchaResolved = false;
    };
  }

  enviarComentario(): void {
    if (!this.postagem) return;
    if (!this.nomeComentario.trim() || !this.textoComentario.trim()) {
      this.erroComentario = 'Nome e comentário são obrigatórios.';
      return;
    }
    if (!this.captchaResolved) {
      this.erroComentario = 'Por favor, complete o captcha.';
      return;
    }

    this.enviandoComentario = true;
    this.erroComentario = '';

    this.comentariosService
      .criar(this.postagem.id, this.nomeComentario.trim(), this.textoComentario.trim(), this.captchaToken)
      .subscribe({
        next: (c: import('../../../services/api.service').ComentarioDto) => {
          this.postagem!.comentarios.unshift(c);
          this.nomeComentario = '';
          this.textoComentario = '';
          this.captchaResolved = false;
          this.captchaToken = '';
          this.comentarioEnviado = true;
          this.enviandoComentario = false;
          // Reset hcaptcha widget
          (window as any).hcaptcha?.reset();
          setTimeout(() => this.comentarioEnviado = false, 5000);
        },
        error: (err: any) => {
          this.erroComentario = err?.error?.message || 'Erro ao enviar comentário.';
          this.enviandoComentario = false;
        }
      });
  }
}
