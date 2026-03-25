namespace quilombos_api.Models;

public class Comentario
{
    public int Id { get; set; }
    public int PostagemId { get; set; }
    public Postagem? Postagem { get; set; }

    public string Nome { get; set; } = string.Empty;
    public string Texto { get; set; } = string.Empty;
    public DateTime DataHora { get; set; } = DateTime.UtcNow;
}
