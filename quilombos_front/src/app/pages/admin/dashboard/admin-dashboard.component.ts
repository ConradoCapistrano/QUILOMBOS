import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { PostagensService, PostagemResumoDto } from '../../../services/api.service';
import { QuilomboService, Quilombo } from '../../../services/quilombo.service';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  abaAtiva: 'posts' | 'quilombos' = 'posts';
  
  // Postagens
  postagens: PostagemResumoDto[] = [];
  totalPosts = 0;
  
  // Quilombos
  quilombos: Quilombo[] = [];
  
  carregando = true;
  page = 1;
  pageSize = 20;

  constructor(
    private postagensService: PostagensService,
    private quilomboService: QuilomboService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void { this.carregar(); }

  setAba(aba: 'posts' | 'quilombos'): void {
    if (this.abaAtiva === aba) return;
    this.abaAtiva = aba;
    this.carregar();
  }

  carregar(): void {
    this.carregando = true;
    if (this.abaAtiva === 'posts') {
      this.postagensService.listar(undefined, this.page, this.pageSize).subscribe({
        next: (res) => { this.postagens = res.data; this.totalPosts = res.total; this.carregando = false; },
        error: () => this.carregando = false
      });
    } else {
      this.quilomboService.getAll().subscribe({
        next: (res) => { this.quilombos = res; this.carregando = false; },
        error: () => this.carregando = false
      });
    }
  }

  // --- POSTAGENS ---
  async deletarPostagem(id: number, titulo: string): Promise<void> {
    const result = await Swal.fire({
      title: 'Confirmar exclusão',
      html: `Deseja excluir a postagem <strong>"${titulo}"</strong>?<br>Essa ação não pode ser desfeita.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#c0392b',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Sim, excluir',
    });

    if (!result.isConfirmed) return;

    this.postagensService.deletar(id).subscribe({
      next: () => {
        this.postagens = this.postagens.filter(p => p.id !== id);
        this.totalPosts--;
        Swal.fire({ icon: 'success', title: 'Postagem excluída!', timer: 1500, showConfirmButton: false });
      },
      error: () => Swal.fire({ icon: 'error', title: 'Erro ao excluir postagem.' })
    });
  }

  // --- QUILOMBOS ---
  async deletarQuilombo(id: number, nome: string): Promise<void> {
    const result = await Swal.fire({
      title: 'Confirmar exclusão',
      html: `Deseja excluir o quilombo <strong>"${nome}"</strong>?<br>Isso removerá todas as informações dele.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#c0392b',
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    this.quilomboService.delete(id).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Excluído!', timer: 1500, showConfirmButton: false });
        this.carregar();
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Erro', 'Não foi possível excluir o quilombo. Ele pode ter postagens associadas.', 'error');
      }
    });
  }

  logout(): void { this.authService.logout(); }

  formatarData(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
