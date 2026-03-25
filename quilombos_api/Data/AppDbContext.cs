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
            new Quilombo { Id = 1, Codigo = 1, Nome = "Riacho dos Porcos", Regiao = "Pernambuco", Municipio = "Sertânia" },
            new Quilombo { Id = 2, Codigo = 2, Nome = "Severo", Regiao = "Pernambuco", Municipio = "Sertânia" },
            new Quilombo { Id = 3, Codigo = 3, Nome = "Buenos Aires", Regiao = "Pernambuco", Municipio = "Custódia" }
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
