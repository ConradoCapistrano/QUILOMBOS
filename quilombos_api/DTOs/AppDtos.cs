namespace quilombos_api.DTOs;

public record LoginDto(string Usuario, string Senha);

public record AlterarSenhaDto(string SenhaAtual, string NovaSenha);

public record AlterarCredenciaisDto(string NovoUsuario, string SenhaAtual, string NovaSenha);

public record PostagemResumoDto(
    int Id,
    int QuilomboId,
    string QuilomboNome,
    string Titulo,
    string? Subtitulo,
    DateTime DataHora,
    string? ImagemHeaderUrl
);

public record PostagemDetalheDto(
    int Id,
    int QuilomboId,
    string QuilomboNome,
    string Titulo,
    string? Subtitulo,
    string Texto,
    DateTime DataHora,
    string? ImagemHeaderUrl,
    List<ImagemDto> Imagens,
    List<ComentarioDto> Comentarios
);

public record ImagemDto(int Id, string Url, string? NomeOriginal, int Ordem);

public record ComentarioDto(int Id, string Nome, string Texto, DateTime DataHora);

public record NovoComentarioDto(string Nome, string Texto, string CaptchaToken);

public record QuilomboDto(
    int Id,
    int Codigo,
    string Nome,
    string? Regiao,
    string? Municipio,
    string? Ano,
    string? Familias,
    string? Descricao,
    string? ImagemUrl,
    string? Historia,
    string? Cultura,
    string? Territorio
);

public record QuilomboInputDto(
    string Nome,
    string? Regiao,
    string? Municipio,
    string? Ano,
    string? Familias,
    string? Descricao,
    string? ImagemUrl,
    string? Historia,
    string? Cultura,
    string? Territorio
);
