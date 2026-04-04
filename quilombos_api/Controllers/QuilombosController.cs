using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using quilombos_api.Data;
using quilombos_api.DTOs;
using quilombos_api.Models;

namespace quilombos_api.Controllers;

[ApiController]
[Route("api/quilombos")]
public class QuilombosController : ControllerBase
{
    private readonly AppDbContext _db;
    public QuilombosController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var quilombos = await _db.Quilombos
            .OrderBy(q => q.Codigo)
            .Select(q => new QuilomboDto(q.Id, q.Codigo, q.Nome, q.Regiao, q.Municipio, q.Ano, q.Familias, q.Descricao, q.ImagemUrl, q.Historia, q.Cultura, q.Territorio))
            .ToListAsync();
        return Ok(quilombos);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var q = await _db.Quilombos.FindAsync(id);
        if (q == null) return NotFound();
        return Ok(new QuilomboDto(q.Id, q.Codigo, q.Nome, q.Regiao, q.Municipio, q.Ano, q.Familias, q.Descricao, q.ImagemUrl, q.Historia, q.Cultura, q.Territorio));
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] QuilomboInputDto dto)
    {
        var nextCode = await _db.Quilombos.MaxAsync(q => (int?)q.Codigo) ?? 0;
        var quilombo = new Quilombo
        {
            Codigo = nextCode + 1,
            Nome = dto.Nome,
            Regiao = dto.Regiao,
            Municipio = dto.Municipio,
            Ano = dto.Ano,
            Familias = dto.Familias,
            Descricao = dto.Descricao,
            ImagemUrl = dto.ImagemUrl,
            Historia = dto.Historia,
            Cultura = dto.Cultura,
            Territorio = dto.Territorio
        };
        _db.Quilombos.Add(quilombo);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = quilombo.Id }, new QuilomboDto(quilombo.Id, quilombo.Codigo, quilombo.Nome, quilombo.Regiao, quilombo.Municipio, quilombo.Ano, quilombo.Familias, quilombo.Descricao, quilombo.ImagemUrl, quilombo.Historia, quilombo.Cultura, quilombo.Territorio));
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] QuilomboInputDto dto)
    {
        var quilombo = await _db.Quilombos.FindAsync(id);
        if (quilombo == null) return NotFound();

        quilombo.Nome = dto.Nome;
        quilombo.Regiao = dto.Regiao;
        quilombo.Municipio = dto.Municipio;
        quilombo.Ano = dto.Ano;
        quilombo.Familias = dto.Familias;
        quilombo.Descricao = dto.Descricao;
        quilombo.ImagemUrl = dto.ImagemUrl;
        quilombo.Historia = dto.Historia;
        quilombo.Cultura = dto.Cultura;
        quilombo.Territorio = dto.Territorio;

        await _db.SaveChangesAsync();
        return Ok(new QuilomboDto(quilombo.Id, quilombo.Codigo, quilombo.Nome, quilombo.Regiao, quilombo.Municipio, quilombo.Ano, quilombo.Familias, quilombo.Descricao, quilombo.ImagemUrl, quilombo.Historia, quilombo.Cultura, quilombo.Territorio));
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var quilombo = await _db.Quilombos.FindAsync(id);
        if (quilombo == null) return NotFound();

        _db.Quilombos.Remove(quilombo);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
