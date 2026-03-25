import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PostagensService } from '../../../services/api.service';
import { QuilombosService, QuilomboDto } from '../../../services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-nova-postagem',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './nova-postagem.component.html',
  styleUrls: ['./nova-postagem.component.scss']
})
export class NovaPostagemComponent implements OnInit {
  quilombos: QuilomboDto[] = [];
  quilomboId: number = 0;
  titulo = '';
  subtitulo = '';
  texto = '';

  headerFile?: File;
  headerPreview?: string;

  imagensFiles: File[] = [];
  imagensPreviews: string[] = [];

  salvando = false;

  constructor(
    private postagensService: PostagensService,
    private quilombosService: QuilombosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.quilombosService.listar().subscribe((q: import('../../../services/api.service').QuilomboDto[]) => {
      this.quilombos = q;
      if (q.length > 0) this.quilomboId = q[0].id;
    });
  }

  onHeaderChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      Swal.fire({ icon: 'warning', title: 'Apenas imagens são aceitas.' }); return;
    }
    this.headerFile = file;
    const reader = new FileReader();
    reader.onload = () => this.headerPreview = reader.result as string;
    reader.readAsDataURL(file);
  }

  onImagensChange(event: Event): void {
    const files = Array.from((event.target as HTMLInputElement).files ?? []);
    const images = files.filter(f => f.type.startsWith('image/'));
    if (images.length !== files.length)
      Swal.fire({ icon: 'warning', title: 'Apenas imagens são aceitas. Vídeos não são suportados.' });

    images.forEach(f => {
      this.imagensFiles.push(f);
      const reader = new FileReader();
      reader.onload = () => this.imagensPreviews.push(reader.result as string);
      reader.readAsDataURL(f);
    });
  }

  removerImagem(index: number): void {
    this.imagensFiles.splice(index, 1);
    this.imagensPreviews.splice(index, 1);
  }

  removerHeader(): void {
    this.headerFile = undefined;
    this.headerPreview = undefined;
  }

  async salvar(): Promise<void> {
    if (!this.quilomboId || !this.titulo.trim() || !this.texto.trim()) {
      Swal.fire({ icon: 'warning', title: 'Preencha todos os campos obrigatórios.' }); return;
    }

    this.salvando = true;
    const form = new FormData();
    form.append('quilomboId', String(this.quilomboId));
    form.append('titulo', this.titulo.trim());
    form.append('subtitulo', this.subtitulo.trim());
    form.append('texto', this.texto);
    if (this.headerFile) form.append('imagemHeader', this.headerFile);
    this.imagensFiles.forEach(f => form.append('imagens', f));

    this.postagensService.criar(form).subscribe({
      next: async (res: { id: number }) => {
        this.salvando = false;
        await Swal.fire({ icon: 'success', title: 'Postagem criada!', timer: 1500, showConfirmButton: false });
        this.router.navigate(['/noticias', res.id]);
      },
      error: (err: any) => {
        this.salvando = false;
        Swal.fire({ icon: 'error', title: 'Erro ao salvar postagem.', text: err?.error?.message || '' });
      }
    });
  }
}
