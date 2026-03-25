import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { PostagensService, PostagemResumoDto } from '../../../services/api.service';
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
  postagens: PostagemResumoDto[] = [];
  total = 0;
  carregando = true;
  page = 1;
  pageSize = 20;

  constructor(
    private postagensService: PostagensService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void { this.carregar(); }

  carregar(): void {
    this.carregando = true;
    this.postagensService.listar(undefined, this.page, this.pageSize).subscribe({
      next: (res: import('../../../services/api.service').PostagensResponse) => { this.postagens = res.data; this.total = res.total; this.carregando = false; },
      error: () => this.carregando = false
    });
  }

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
        this.total--;
        Swal.fire({ icon: 'success', title: 'Postagem excluída!', timer: 1500, showConfirmButton: false });
      },
      error: () => Swal.fire({ icon: 'error', title: 'Erro ao excluir postagem.' })
    });
  }

  logout(): void { this.authService.logout(); }

  formatarData(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
