import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { QuilomboService, Quilombo } from '../../../services/quilombo.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-quilombo-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-quilombo-form.component.html',
  styleUrls: ['./admin-quilombo-form.component.scss']
})
export class AdminQuilomboFormComponent implements OnInit {
  isEdit = false;
  id?: number;
  
  quilombo: Partial<Quilombo> = {
    nome: '',
    regiao: '',
    municipio: '',
    ano: '',
    familias: '',
    descricao: '',
    imagemUrl: '',
    historia: '',
    cultura: '',
    territorio: ''
  };

  salvando = false;

  constructor(
    private quilomboService: QuilomboService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      this.id = Number(idParam);
      this.carregar(this.id);
    }
  }

  carregar(id: number): void {
    this.quilomboService.getById(id).subscribe({
      next: (q) => this.quilombo = { ...q },
      error: () => {
        Swal.fire('Erro', 'Não foi possível carregar o quilombo.', 'error');
        this.router.navigate(['/admin/dashboard']);
      }
    });
  }

  salvar(): void {
    if (!this.quilombo.nome?.trim()) {
      Swal.fire('Aviso', 'O nome do quilombo é obrigatório.', 'warning');
      return;
    }

    this.salvando = true;
    const request = this.isEdit && this.id
      ? this.quilomboService.update(this.id, this.quilombo)
      : this.quilomboService.create(this.quilombo);

    request.subscribe({
      next: () => {
        this.salvando = false;
        Swal.fire({
          icon: 'success',
          title: `Quilombo ${this.isEdit ? 'atualizado' : 'criado'}!`,
          timer: 1500,
          showConfirmButton: false
        });
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        this.salvando = false;
        Swal.fire('Erro', 'Falha ao salvar informações do quilombo.', 'error');
        console.error(err);
      }
    });
  }
}
