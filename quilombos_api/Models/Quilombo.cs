namespace quilombos_api.Models;

public class Quilombo
{
    public int Id { get; set; }
    public int Codigo { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string? Regiao { get; set; }
    public string? Municipio { get; set; }
    public string? Ano { get; set; }
    public string? Familias { get; set; }
    public string? Descricao { get; set; }
    public string? ImagemUrl { get; set; }
    public string? Historia { get; set; }
    public string? Cultura { get; set; }
    public string? Territorio { get; set; }

    public ICollection<Postagem> Postagens { get; set; } = new List<Postagem>();
}
