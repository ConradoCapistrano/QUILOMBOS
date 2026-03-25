namespace quilombos_api.Models;

public class ImagemPostagem
{
    public int Id { get; set; }
    public int PostagemId { get; set; }
    public Postagem? Postagem { get; set; }

    // Path relative to wwwroot/uploads
    public string Path { get; set; } = string.Empty;
    public string? NomeOriginal { get; set; }
    public int Ordem { get; set; } = 0;
}
