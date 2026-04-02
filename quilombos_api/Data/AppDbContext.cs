using Microsoft.EntityFrameworkCore;
using quilombos_api.Models;

namespace quilombos_api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Quilombo> Quilombos => Set<Quilombo>();
    public DbSet<Postagem> Postagens => Set<Postagem>();
    public DbSet<ImagemPostagem> ImagensPostagem => Set<ImagemPostagem>();
    public DbSet<Comentario> Comentarios => Set<Comentario>();
    public DbSet<Admin> Admins => Set<Admin>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Unique constraint for Quilombo.Codigo
        modelBuilder.Entity<Quilombo>()
            .HasIndex(q => q.Codigo)
            .IsUnique();

        // Unique constraint for Admin.Usuario
        modelBuilder.Entity<Admin>()
            .HasIndex(a => a.Usuario)
            .IsUnique();

        // Cascade delete for Postagem → Imagens
        modelBuilder.Entity<ImagemPostagem>()
            .HasOne(i => i.Postagem)
            .WithMany(p => p.Imagens)
            .HasForeignKey(i => i.PostagemId)
            .OnDelete(DeleteBehavior.Cascade);

        // Cascade delete for Postagem → Comentarios
        modelBuilder.Entity<Comentario>()
            .HasOne(c => c.Postagem)
            .WithMany(p => p.Comentarios)
            .HasForeignKey(c => c.PostagemId)
            .OnDelete(DeleteBehavior.Cascade);

        // Seed quilombos
        modelBuilder.Entity<Quilombo>().HasData(
            new Quilombo { 
                Id = 1, Codigo = 1, Nome = "Riacho dos Porcos", Regiao = "Pernambuco", Municipio = "Sertânia",
                Ano = "Origem no século XIX", Familias = "Aproximadamente 40 a 50 famílias",
                Descricao = "A comunidade quilombola Riacho dos Porcos, localizada no município de Sertânia, no sertão de Pernambuco, tem origem ligada à formação de refúgios de pessoas negras que resistiram ao período escravocrata no século XIX. A comunidade preserva práticas tradicionais como a agricultura de subsistência, com destaque para o cultivo de milho, feijão e mandioca. Além disso, mantém viva a memória de seus antepassados por meio da oralidade, fortalecendo a identidade coletiva e os laços comunitários. O território é também espaço de resistência cultural e luta pelo reconhecimento de direitos territoriais."
            },
            new Quilombo { 
                Id = 2, Codigo = 2, Nome = "Severo", Regiao = "Pernambuco", Municipio = "Sertânia",
                Ano = "Século XIX (formação tradicional)", Familias = "Cerca de 30 famílias",
                Descricao = "O Quilombo Severo é uma comunidade tradicional situada em Sertânia, Pernambuco, marcada pela forte preservação de saberes ancestrais. Sua formação remonta ao período pós-escravidão, quando famílias negras se estabeleceram na região em busca de autonomia e liberdade. A comunidade se destaca pela prática da agricultura familiar e pelo uso de conhecimentos tradicionais, como o cultivo de plantas medicinais e técnicas de manejo da terra adaptadas ao semiárido. As manifestações culturais, como festas religiosas e celebrações comunitárias, reforçam a identidade quilombola e a continuidade de suas tradições."
            },
            new Quilombo { 
                Id = 3, Codigo = 3, Nome = "Buenos Aires", Regiao = "Pernambuco", Municipio = "Custódia",
                Ano = "Origem no século XIX", Familias = "Cerca de 50 a 60 famílias",
                Descricao = "A comunidade quilombola Buenos Aires, localizada no município de Custódia, Pernambuco, é um importante exemplo de resistência e preservação da cultura afro-brasileira no sertão. Formada por descendentes de pessoas negras que buscaram refúgio durante e após o período escravocrata, a comunidade mantém tradições culturais por meio da culinária típica, do artesanato e das práticas religiosas. A economia local é baseada na agricultura familiar e na criação de pequenos animais. A transmissão de conhecimentos entre gerações fortalece a identidade da comunidade e sua luta pelo reconhecimento e pela valorização de seu território."
            }
        );

        // Seed admin (password: admin2026 — will be changed by user)
        modelBuilder.Entity<Admin>().HasData(
            new Admin
            {
                Id = 1,
                Usuario = "admin2026_quilombos",
                SenhaHash = BCrypt.Net.BCrypt.HashPassword("admin2026")
            }
        );
    }
}
