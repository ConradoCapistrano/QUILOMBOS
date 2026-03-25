using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using quilombos_api.Data;
using quilombos_api.DTOs;
using quilombos_api.Models;

namespace quilombos_api.Controllers;

[ApiController]
[Route("api/postagens")]
public class PostagensController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;

    public PostagensController(AppDbContext db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }

    // GET /api/postagens?quilomboId=1&page=1&pageSize=10
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? quilomboId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var query = _db.Postagens
            .Include(p => p.Quilombo)
            .AsQueryable();

        if (quilomboId.HasValue)
            query = query.Where(p => p.QuilomboId == quilomboId.Value);

        var total = await query.CountAsync();

        var postagens = await query
            .OrderByDescending(p => p.DataHora)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new PostagemResumoDto(
                p.Id,
                p.QuilomboId,
                p.Quilombo!.Nome,
                p.Titulo,
                p.Subtitulo,
                p.DataHora,
                p.ImagemHeaderPath != null ? $"{Request.Scheme}://{Request.Host}/uploads/{p.ImagemHeaderPath}" : null
            ))
            .ToListAsync();

        return Ok(new { total, page, pageSize, data = postagens });
    }

    // GET /api/postagens/{id}
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var p = await _db.Postagens
            .Include(p => p.Quilombo)
            .Include(p => p.Imagens.OrderBy(i => i.Ordem))
            .Include(p => p.Comentarios.OrderByDescending(c => c.DataHora))
            .FirstOrDefaultAsync(p => p.Id == id);

        if (p == null) return NotFound();

        var baseUrl = $"{Request.Scheme}://{Request.Host}";

        var dto = new PostagemDetalheDto(
            p.Id,
            p.QuilomboId,
            p.Quilombo!.Nome,
            p.Titulo,
            p.Subtitulo,
            p.Texto,
            p.DataHora,
            p.ImagemHeaderPath != null ? $"{baseUrl}/uploads/{p.ImagemHeaderPath}" : null,
            p.Imagens.Select(i => new ImagemDto(i.Id, $"{baseUrl}/uploads/{i.Path}", i.NomeOriginal, i.Ordem)).ToList(),
            p.Comentarios.Select(c => new ComentarioDto(c.Id, c.Nome, c.Texto, c.DataHora)).ToList()
        );

        return Ok(dto);
    }

    // POST /api/postagens  [Authorize]
    [Authorize]
    [HttpPost]
    [RequestSizeLimit(100_000_000)] // 100 MB max
    public async Task<IActionResult> Create([FromForm] CriarPostagemForm form)
    {
        var quilombo = await _db.Quilombos.FindAsync(form.QuilomboId);
        if (quilombo == null) return BadRequest(new { message = "Quilombo não encontrado." });

        var uploadsDir = Path.Combine(_env.WebRootPath, "uploads");
        Directory.CreateDirectory(uploadsDir);

        string? headerPath = null;
        if (form.ImagemHeader != null)
            headerPath = await SaveFile(form.ImagemHeader, uploadsDir);

        var postagem = new Postagem
        {
            QuilomboId = form.QuilomboId,
            Titulo = form.Titulo,
            Subtitulo = form.Subtitulo,
            Texto = form.Texto,
            DataHora = DateTime.UtcNow,
            ImagemHeaderPath = headerPath,
        };

        _db.Postagens.Add(postagem);
        await _db.SaveChangesAsync();

        if (form.Imagens != null && form.Imagens.Count > 0)
        {
            int ordem = 0;
            foreach (var img in form.Imagens)
            {
                var path = await SaveFile(img, uploadsDir);
                _db.ImagensPostagem.Add(new ImagemPostagem
                {
                    PostagemId = postagem.Id,
                    Path = path,
                    NomeOriginal = img.FileName,
                    Ordem = ordem++,
                });
            }
            await _db.SaveChangesAsync();
        }

        return CreatedAtAction(nameof(GetById), new { id = postagem.Id }, new { id = postagem.Id });
    }

    // DELETE /api/postagens/{id}  [Authorize]
    [Authorize]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var postagem = await _db.Postagens
            .Include(p => p.Imagens)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (postagem == null) return NotFound();

        var uploadsDir = Path.Combine(_env.WebRootPath, "uploads");

        // Delete files from disk
        if (postagem.ImagemHeaderPath != null)
        {
            var fullPath = Path.Combine(uploadsDir, postagem.ImagemHeaderPath);
            if (System.IO.File.Exists(fullPath)) System.IO.File.Delete(fullPath);
        }

        foreach (var img in postagem.Imagens)
        {
            var fullPath = Path.Combine(uploadsDir, img.Path);
            if (System.IO.File.Exists(fullPath)) System.IO.File.Delete(fullPath);
        }

        _db.Postagens.Remove(postagem);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static async Task<string> SaveFile(IFormFile file, string uploadsDir)
    {
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        var fileName = $"{Guid.NewGuid()}{ext}";
        var fullPath = Path.Combine(uploadsDir, fileName);
        using var stream = System.IO.File.Create(fullPath);
        await file.CopyToAsync(stream);
        return fileName;
    }
}

// Form model for multipart/form-data
public class CriarPostagemForm
{
    public int QuilomboId { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string? Subtitulo { get; set; }
    public string Texto { get; set; } = string.Empty;
    public IFormFile? ImagemHeader { get; set; }
    public List<IFormFile>? Imagens { get; set; }
}
