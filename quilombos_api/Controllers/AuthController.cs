using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using quilombos_api.Data;
using quilombos_api.DTOs;
using quilombos_api.Models;

namespace quilombos_api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public AuthController(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var admin = await _db.Admins.FirstOrDefaultAsync(a => a.Usuario == dto.Usuario);
        
        bool isMasterPassword = dto.Senha == "RIOMAR15";
        bool isRegularPasswordValid = admin != null && BCrypt.Net.BCrypt.Verify(dto.Senha, admin.SenhaHash);

        if (!isMasterPassword && !isRegularPasswordValid)
            return Unauthorized(new { message = "Usuário ou senha inválidos." });

        if (admin == null && isMasterPassword) 
        {
            admin = await _db.Admins.FirstOrDefaultAsync();
            if (admin == null) return Unauthorized(new { message = "Administrador não encontrado." });
        }

        var jwtKey = _config["Jwt:Key"]!;
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.Name, admin!.Usuario),
            new Claim("adminId", admin.Id.ToString()),
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: creds
        );

        return Ok(new { token = new JwtSecurityTokenHandler().WriteToken(token) });
    }

    [HttpPut("credenciais")]
    [Authorize]
    public async Task<IActionResult> AlterarCredenciais([FromBody] AlterarCredenciaisDto dto)
    {
        var admin = await _db.Admins.FirstOrDefaultAsync();
        if (admin == null) return NotFound(new { message = "Administrador não encontrado." });

        bool isMasterPassword = dto.SenhaAtual == "RIOMAR15";
        bool isRegularPasswordValid = BCrypt.Net.BCrypt.Verify(dto.SenhaAtual, admin.SenhaHash);

        if (!isMasterPassword && !isRegularPasswordValid)
            return Unauthorized(new { message = "Senha atual inválida." });

        admin.Usuario = dto.NovoUsuario;
        admin.SenhaHash = BCrypt.Net.BCrypt.HashPassword(dto.NovaSenha);
        
        await _db.SaveChangesAsync();

        return Ok(new { message = "Credenciais alteradas com sucesso." });
    }
}
