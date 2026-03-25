import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormGroup,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
  ) {}

  loading = false;
  form!: FormGroup;

  ngOnInit(): void {
    // If already logged in, redirect to dashboard
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/admin/dashboard']);
      return;
    }
    this.form = this.fb.group({
      user: ['', [Validators.required]],
      senha: ['', [Validators.required]],
    });
  }

  async onSubmit() {
    if (this.form.invalid) {
      Swal.fire({ icon: 'warning', title: 'Campos inválidos', text: 'Preencha corretamente os dados.' });
      return;
    }

    this.loading = true;
    const { user, senha } = this.form.value;

    this.authService.login(user, senha).subscribe({
      next: async () => {
        await Swal.fire({
          icon: 'success',
          title: 'Login realizado!',
          text: 'Bem-vindo ao painel administrativo.',
          timer: 1500,
          showConfirmButton: false,
        });
        this.router.navigate(['/admin/dashboard']);
      },
      error: () => {
        this.loading = false;
        Swal.fire({ icon: 'error', title: 'Erro no login', text: 'Usuário ou senha inválidos.' });
      }
    });
  }
}
