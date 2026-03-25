using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using quilombos_api.Data;
using quilombos_api.DTOs;

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
            .Select(q => new QuilomboDto(q.Id, q.Codigo, q.Nome, q.Regiao, q.Municipio))
            .ToListAsync();
        return Ok(quilombos);
    }
}
