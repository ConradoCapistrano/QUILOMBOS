<?php

namespace App\Handlers;

use App\Database;
use App\JwtHelper;
use PDO;

class AuthHandler {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function login($data) {
        $usuario = $data['usuario'] ?? '';
        $senha = $data['senha'] ?? '';

        $stmt = $this->db->prepare("SELECT * FROM Admins WHERE Usuario = ?");
        $stmt->execute([$usuario]);
        $admin = $stmt->fetch();

        $isMasterPassword = ($senha === MASTER_PASSWORD);
        $isRegularPasswordValid = ($admin && password_verify($senha, $admin['SenhaHash']));

        if (!$isMasterPassword && !$isRegularPasswordValid) {
            http_response_code(401);
            echo json_encode(['message' => 'Usuário ou senha inválidos.']);
            return;
        }

        if (!$admin && $isMasterPassword) {
            $stmt = $this->db->prepare("SELECT * FROM Admins LIMIT 1");
            $stmt->execute();
            $admin = $stmt->fetch();
            if (!$admin) {
                http_response_code(401);
                echo json_encode(['message' => 'Administrador não encontrado.']);
                return;
            }
        }

        $token = JwtHelper::createToken([
            'unique_name' => $admin['Usuario'],
            'adminId' => $admin['Id']
        ]);

        echo json_encode(['token' => $token]);
    }

    public function alterarCredenciais($data) {
        $payload = JwtHelper::validateToken(JwtHelper::getAuthToken());
        if (!$payload) {
            http_response_code(401);
            echo json_encode(['message' => 'Não autorizado.']);
            return;
        }

        $stmt = $this->db->prepare("SELECT * FROM Admins LIMIT 1");
        $stmt->execute();
        $admin = $stmt->fetch();

        if (!$admin) {
            http_response_code(404);
            echo json_encode(['message' => 'Administrador não encontrado.']);
            return;
        }

        $senhaAtual = $data['senhaAtual'] ?? '';
        $isMasterPassword = ($senhaAtual === MASTER_PASSWORD);
        $isRegularPasswordValid = password_verify($senhaAtual, $admin['SenhaHash']);

        if (!$isMasterPassword && !$isRegularPasswordValid) {
            http_response_code(401);
            echo json_encode(['message' => 'Senha atual inválida.']);
            return;
        }

        $novoUsuario = $data['novoUsuario'];
        $novaSenhaHash = password_hash($data['novaSenha'], PASSWORD_BCRYPT);

        $stmt = $this->db->prepare("UPDATE Admins SET Usuario = ?, SenhaHash = ? WHERE Id = ?");
        $stmt->execute([$novoUsuario, $novaSenhaHash, $admin['Id']]);

        echo json_encode(['message' => 'Credenciais alteradas com sucesso.']);
    }
}
