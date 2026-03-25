import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface QuilomboDto {
  id: number; codigo: number; nome: string; regiao?: string; municipio?: string;
}

export interface PostagemResumoDto {
  id: number; quilomboId: number; quilomboNome: string;
  titulo: string; subtitulo?: string; dataHora: string; imagemHeaderUrl?: string;
}

export interface PostagemDetalheDto extends PostagemResumoDto {
  texto: string;
  imagens: ImagemDto[];
  comentarios: ComentarioDto[];
}

export interface ImagemDto { id: number; url: string; nomeOriginal?: string; ordem: number; }
export interface ComentarioDto { id: number; nome: string; texto: string; dataHora: string; }

export interface PostagensResponse {
  total: number; page: number; pageSize: number; data: PostagemResumoDto[];
}

@Injectable({ providedIn: 'root' })
export class PostagensService {
  private base = `${environment.apiUrl}/postagens`;

  constructor(private http: HttpClient) {}

  listar(quilomboId?: number, page = 1, pageSize = 9): Observable<PostagensResponse> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (quilomboId) params = params.set('quilomboId', quilomboId);
    return this.http.get<PostagensResponse>(this.base, { params });
  }

  getById(id: number): Observable<PostagemDetalheDto> {
    return this.http.get<PostagemDetalheDto>(`${this.base}/${id}`);
  }

  criar(dados: FormData): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(this.base, dados);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class QuilombosService {
  constructor(private http: HttpClient) {}

  listar(): Observable<QuilomboDto[]> {
    return this.http.get<QuilomboDto[]>(`${environment.apiUrl}/quilombos`);
  }
}

@Injectable({ providedIn: 'root' })
export class ComentariosService {
  constructor(private http: HttpClient) {}

  criar(postagemId: number, nome: string, texto: string, captchaToken: string): Observable<ComentarioDto> {
    return this.http.post<ComentarioDto>(
      `${environment.apiUrl}/postagens/${postagemId}/comentarios`,
      { nome, texto, captchaToken }
    );
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/comentarios/${id}`);
  }
}
