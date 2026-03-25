namespace quilombos_api.Models;

public class Quilombo
{
    public int Id { get; set; }
    public int Codigo { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string? Regiao { get; set; }
    public string? Municipio { get; set; }

    public ICollection<Postagem> Postagens { get; set; } = new List<Postagem>();
}
