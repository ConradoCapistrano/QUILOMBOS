using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net.Http;
using System.Text.Json;
using quilombos_api.Data;
using quilombos_api.DTOs;
using quilombos_api.Models;

namespace quilombos_api.Controllers;

[ApiController]
[Route("api")]
public class ComentariosController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;
    private readonly IHttpClientFactory _httpClientFactory;

    public ComentariosController(AppDbContext db, IConfiguration config, IHttpClientFactory httpClientFactory)
    {
        _db = db;
        _config = config;
        _httpClientFactory = httpClientFactory;
    }

    // GET /api/postagens/{postagemId}/comentarios
    [HttpGet("postagens/{postagemId:int}/comentarios")]
    public async Task<IActionResult> GetByPostagem(int postagemId)
    {
        var comentarios = await _db.Comentarios
            .Where(c => c.PostagemId == postagemId)
            .OrderByDescending(c => c.DataHora)
            .Select(c => new ComentarioDto(c.Id, c.Nome, c.Texto, c.DataHora))
            .ToListAsync();
        return Ok(comentarios);
    }

    // POST /api/postagens/{postagemId}/comentarios
    [HttpPost("postagens/{postagemId:int}/comentarios")]
    public async Task<IActionResult> CriarComentario(int postagemId, [FromBody] NovoComentarioDto dto)
    {
        // Validate captcha
        var captchaSecret = _config["HCaptcha:Secret"]!;
        var isValid = await ValidateCaptcha(dto.CaptchaToken, captchaSecret);
        if (!isValid)
            return BadRequest(new { message = "Captcha inválido. Por favor, tente novamente." });

        var postagem = await _db.Postagens.FindAsync(postagemId);
        if (postagem == null) return NotFound();

        if (string.IsNullOrWhiteSpace(dto.Nome) || string.IsNullOrWhiteSpace(dto.Texto))
            return BadRequest(new { message = "Nome e comentário são obrigatórios." });

        var comentario = new Comentario
        {
            PostagemId = postagemId,
            Nome = dto.Nome.Trim(),
            Texto = dto.Texto.Trim(),
            DataHora = DateTime.UtcNow,
        };

        _db.Comentarios.Add(comentario);
        await _db.SaveChangesAsync();

        return Ok(new ComentarioDto(comentario.Id, comentario.Nome, comentario.Texto, comentario.DataHora));
    }

    // DELETE /api/comentarios/{id}  [Authorize]
    [Authorize]
    [HttpDelete("comentarios/{id:int}")]
    public async Task<IActionResult> DeletarComentario(int id)
    {
        var comentario = await _db.Comentarios.FindAsync(id);
        if (comentario == null) return NotFound();
        _db.Comentarios.Remove(comentario);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private async Task<bool> ValidateCaptcha(string token, string secret)
    {
        try
        {
            var client = _httpClientFactory.CreateClient();
            var content = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                { "secret", secret },
                { "response", token }
            });
            var response = await client.PostAsync("https://hcaptcha.com/siteverify", content);
            var json = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<HCaptchaResponse>(json);
            return result?.Success == true;
        }
        catch
        {
            return false;
        }
    }
}

internal record HCaptchaResponse(
    [property: System.Text.Json.Serialization.JsonPropertyName("success")] bool Success
);
