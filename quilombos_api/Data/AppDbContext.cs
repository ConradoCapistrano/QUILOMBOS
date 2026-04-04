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
                Descricao = "O Quilombo Riacho dos Porcos é um território de resistência que pulsa desde os tempos da escravidão.",
                ImagemUrl = "assets/riacho.png",
                Historia = "O Quilombo Riacho dos Porcos, em Sertânia, Pernambuco, é um território de resistência que pulsa desde os tempos da escravidão. Aqui, a terra foi conquistada com suor e sangue, e cada palmo de chão conta histórias de liberdade. Os mais velhos ainda lembram dos causos contados ao pé do fogo, histórias que atravessaram gerações sem precisar de papel. É da oralidade que nasce a força dessa comunidade, que mantém viva a memória dos que vieram antes e abre caminhos para os que virão.",
                Cultura = "A cultura aqui é vivida no dia a dia. É na roda de conversa, na farinhada, na festa de santo, na benzeção que a vizinha faz. É no saber de parteira, no conhecimento das ervas, na reza que acalma e no trabalho coletivo da roça. A música é memória, o tambor ecoa, e a culinária traz o gosto do milho, da mandioca e do feijão plantado com as próprias mãos. A ancestralidade não é lembrança, é presença viva que guia os passos de quem anda por essas terras.",
                Territorio = "O território não é só chão. É identidade, é pertencimento, é a certeza de que aqui se pode ser quem se é. É o lugar onde os pés se firmam e onde os sonhos se plantam. É onde o trabalho coletivo transforma a terra em sustento e a luta em esperança. Defender esse território é defender a memória dos que vieram antes e o futuro dos que virão depois. É resistir com as mãos na terra e o coração na história."
            },
            new Quilombo { 
                Id = 2, Codigo = 2, Nome = "Severo", Regiao = "Pernambuco", Municipio = "Sertânia",
                Ano = "Século XIX (formação tradicional)", Familias = "Cerca de 30 famílias",
                Descricao = "Severo é nome de gente, mas também é nome de lugar. É comunidade que carrega no nome a força de quem não se curvou.",
                ImagemUrl = "assets/severo.png",
                Historia = "Severo é nome de gente, mas também é nome de lugar. É comunidade que carrega no nome a força de quem não se curvou. Formada nos tempos do cativeiro, essa terra foi refúgio de quem buscou liberdade e se tornou lar de quem nela se enraizou. As histórias se misturam: do tempo do engenho, da fuga, da fundação do quilombo, da luta pela terra que nunca terminou. A memória de Severo é memória de luta, mas também de fé, de festa e de muita mandinga.",
                Cultura = "A cultura em Severo se aprende desde cedo. É no respeito aos mais velhos, nas histórias de assombração contadas à noite, no benzimento que cura, no trabalho da roça que alimenta corpo e alma. As tradições se renovam a cada geração, sem perder o fio que conecta le presente ao passado. O som do tambor, o cheiro do fumo de corda, o sabor da rapadura feita no engenho: tudo isso é cultura, é identidade, é quilombo.",
                Territorio = "O território de Severo é um corpo vivo. Cada grota, cada serra, cada nascente tem nome e história. É onde as famílias constroem suas casas, plantam seus roçados e criam seus filhos. É onde a comunidade se reúne para decidir os rumos, para celebrar e para resistir. Sem terra não tem quilombo. Em Severo, essa lição está gravada na alma de cada morador."
            },
            new Quilombo { 
                Id = 3, Codigo = 3, Nome = "Buenos Aires", Regiao = "Pernambuco", Municipio = "Custódia",
                Ano = "Origem no século XIX", Familias = "Cerca de 50 a 60 famílias",
                Descricao = "Buenos Aires, em Custódia, é um quilombo que respira diversidade.",
                ImagemUrl = "assets/bueno.png",
                Historia = "Buenos Aires, em Custódia, é um quilombo que respira diversidade. Aqui, mais de 250 famílias tecem uma história de resistência que mistura origens e saberes. Diferente de outros quilombos, Buenos Aires cresceu na confluência de culturas, sem nunca perder sua raiz negra. A terra foi conquistada a duras penas, em processos de luta que marcaram gerações. Hoje, a comunidade carrega no peito a certeza de que seu lugar é aqui, onde a história se faz coletivamente.",
                Cultura = "A cultura de Buenos Aires é plural como sua gente. Tem o forró, tem o coco, tem a reza, tem o trabalho. É na feira, na casa de farinha, nas rodas de conversa que a cultura se reinventa. Os saberes populares são guardados com orgulho: o manejo da terra, o cuidado com os animais, o preparo dos alimentos. Aqui, ser quilombola é uma identidade assumida com orgulho, celebrada em cada gesto do cotidiano.",
                Territorio = "O território de Buenos Aires é espaço de encontro. É onde diferentes famílias constroem suas vidas em comum. É terra de criação, de plantio, de partilha. É onde a natureza e a comunidade se entrelaçam, formando um lugar único no sertão pernambucano. A defesa desse território é a defesa de um modo de vida, de uma história que não pode se perder."
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
