import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/admin/login/login.component';
import { HistoriasComponent } from './pages/historias/historias.component';
import { QuilombosComponent } from './pages/quilombos/quilombos.component';
import { NoticiasComponent } from './pages/noticias/noticias.component';
import { PostagemDetalheComponent } from './pages/noticias/postagem-detalhe/postagem-detalhe.component';
import { AdminDashboardComponent } from './pages/admin/dashboard/admin-dashboard.component';
import { NovaPostagemComponent } from './pages/admin/nova-postagem/nova-postagem.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'quilombos', component: QuilombosComponent },
  { path: 'historias', component: HistoriasComponent },
  { path: 'noticias', component: NoticiasComponent },
  { path: 'noticias/:id', component: PostagemDetalheComponent },
  { path: 'admin/login', component: LoginComponent },
  { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [authGuard] },
  { path: 'admin/postagem/nova', component: NovaPostagemComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];
