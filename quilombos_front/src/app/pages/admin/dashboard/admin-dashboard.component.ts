import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  PostagensService,
  PostagemResumoDto,
} from '../../../services/api.service';
import { QuilomboService, Quilombo } from '../../../services/quilombo.service';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit {
  abaAtiva: 'posts' | 'quilombos' = 'posts';

  postagens: PostagemResumoDto[] = [];
  totalPosts = 0;
  quilombos: Quilombo[] = [];
  carregando = true;
  page = 1;
  pageSize = 20;

  // ========== MODAL DE REDEFINIÇÃO DE SENHA ==========
  modalPasswordOpen = false;
  senhaAtual = '';
  novaSenha = '';
  confirmarSenha = '';
  enviando = false;
  sucessoMensagem = '';
  erroMensagem = '';

  // Controle de visibilidade das senhas
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(
    private postagensService: PostagensService,
    private quilomboService: QuilomboService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.carregar();
  }

  // Fechar modal ao pressionar ESC
  @HostListener('document:keydown.escape')
  onEscapePress() {
    if (this.modalPasswordOpen) this.closePasswordModal();
  }

  setAba(aba: 'posts' | 'quilombos'): void {
    if (this.abaAtiva === aba) return;
    this.abaAtiva = aba;
    this.carregar();
  }

  carregar(): void {
    this.carregando = true;
    if (this.abaAtiva === 'posts') {
      this.postagensService
        .listar(undefined, this.page, this.pageSize)
        .subscribe({
          next: (res) => {
            this.postagens = res.data;
            this.totalPosts = res.total;
            this.carregando = false;
          },
          error: () => (this.carregando = false),
        });
    } else {
      this.quilomboService.getAll().subscribe({
        next: (res) => {
          this.quilombos = res;
          this.carregando = false;
        },
        error: () => (this.carregando = false),
      });
    }
  }

  async deletarPostagem(id: number, titulo: string): Promise<void> {
    const result = await Swal.fire({
      title: 'Excluir publicação?',
      html: `<span style="color:#ece2d4">"${titulo}"</span> será removida para sempre.`,
      icon: 'warning',
      background: '#1a120b',
      color: '#ece2d4',
      showCancelButton: true,
      confirmButtonColor: '#8b3a3a',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Sim, excluir',
    });

    if (!result.isConfirmed) return;

    this.postagensService.deletar(id).subscribe({
      next: () => {
        this.postagens = this.postagens.filter((p) => p.id !== id);
        this.totalPosts--;
        Swal.fire({
          icon: 'success',
          title: 'Excluída!',
          timer: 1500,
          showConfirmButton: false,
          background: '#1a120b',
          color: '#ece2d4',
        });
      },
      error: () =>
        Swal.fire({
          icon: 'error',
          title: 'Erro ao excluir',
          background: '#1a120b',
          color: '#ece2d4',
        }),
    });
  }

  async deletarQuilombo(id: number, nome: string): Promise<void> {
    const result = await Swal.fire({
      title: 'Excluir comunidade?',
      html: `<span style="color:#ece2d4">"${nome}"</span> será removida.`,
      icon: 'warning',
      background: '#1a120b',
      color: '#ece2d4',
      showCancelButton: true,
      confirmButtonColor: '#8b3a3a',
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
    });

    if (!result.isConfirmed) return;

    this.quilomboService.delete(id).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Excluída!',
          timer: 1500,
          showConfirmButton: false,
          background: '#1a120b',
          color: '#ece2d4',
        });
        this.carregar();
      },
      error: () => Swal.fire('Erro', 'Não foi possível excluir', 'error'),
    });
  }

  // ========== MÉTODOS DO MODAL DE REDEFINIÇÃO DE SENHA ==========
  openPasswordModal(): void {
    this.modalPasswordOpen = true;
    this.resetPasswordForm();
  }

  closePasswordModal(): void {
    this.modalPasswordOpen = false;
    this.resetPasswordForm();
  }

  resetPasswordForm(): void {
    this.senhaAtual = '';
    this.novaSenha = '';
    this.confirmarSenha = '';
    this.sucessoMensagem = '';
    this.erroMensagem = '';
    this.enviando = false;
  }

  toggleCurrentPassword(): void {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleNewPassword(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  get senhaMismatch(): boolean {
    return (
      this.novaSenha !== '' &&
      this.confirmarSenha !== '' &&
      this.novaSenha !== this.confirmarSenha
    );
  }

  get passwordStrength(): 'weak' | 'medium' | 'strong' {
    const pwd = this.novaSenha;
    if (!pwd) return 'weak';
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;
    if (strength <= 2) return 'weak';
    if (strength === 3) return 'medium';
    return 'strong';
  }

  getPasswordStrengthText(): string {
    const s = this.passwordStrength;
    if (s === 'weak') return 'Senha fraca';
    if (s === 'medium') return 'Senha média';
    return 'Senha forte';
  }

  alterarCredenciais(): void {
    // Validações
    if (!this.senhaAtual) {
      this.erroMensagem = 'Digite sua senha atual';
      return;
    }

    if (!this.novaSenha) {
      this.erroMensagem = 'Digite a nova senha';
      return;
    }

    if (this.novaSenha.length < 6) {
      this.erroMensagem = 'A nova senha deve ter pelo menos 6 caracteres';
      return;
    }

    if (this.novaSenha !== this.confirmarSenha) {
      this.erroMensagem = 'As senhas não coincidem';
      return;
    }

    this.enviando = true;
    this.erroMensagem = '';
    this.sucessoMensagem = '';

    // Buscar o nome do usuário atual do localStorage ou usar 'admin'
    const usuarioAtual = localStorage.getItem('usuario') || 'admin';

    this.authService
      .alterarCredenciais({
        senhaAtual: this.senhaAtual,
        novoUsuario: usuarioAtual,
        novaSenha: this.novaSenha,
      })
      .subscribe({
        next: (res: any) => {
          this.sucessoMensagem = res.message || 'Senha alterada com sucesso!';
          this.enviando = false;

          // Limpar formulário
          this.senhaAtual = '';
          this.novaSenha = '';
          this.confirmarSenha = '';

          // Fechar modal após 2 segundos
          setTimeout(() => {
            this.closePasswordModal();
            Swal.fire({
              icon: 'success',
              title: 'Senha alterada!',
              text: 'Sua nova senha foi salva com sucesso',
              timer: 2000,
              showConfirmButton: false,
              background: '#1a120b',
              color: '#ece2d4',
            });
          }, 2000);
        },
        error: (err: any) => {
          this.erroMensagem = err.error?.message || 'Erro ao alterar senha';
          this.enviando = false;
        },
      });
  }

  logout(): void {
    this.authService.logout();
  }

  formatarData(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}
