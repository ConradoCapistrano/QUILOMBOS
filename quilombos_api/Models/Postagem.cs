namespace quilombos_api.Models;

public class Postagem
{
    public int Id { get; set; }
    public int QuilomboId { get; set; }
    public Quilombo? Quilombo { get; set; }

    public string Titulo { get; set; } = string.Empty;
    public string? Subtitulo { get; set; }
    public string Texto { get; set; } = string.Empty;
    public DateTime DataHora { get; set; } = DateTime.UtcNow;

    // Header image stored as path relative to wwwroot/uploads
    public string? ImagemHeaderPath { get; set; }

    public ICollection<ImagemPostagem> Imagens { get; set; } = new List<ImagemPostagem>();
    public ICollection<Comentario> Comentarios { get; set; } = new List<Comentario>();
}
