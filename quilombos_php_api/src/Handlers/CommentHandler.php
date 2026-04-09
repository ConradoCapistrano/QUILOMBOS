<?php

namespace App\Handlers;

use App\Database;
use App\JwtHelper;
use PDO;

class CommentHandler {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getByPostagem($postagemId) {
        $stmt = $this->db->prepare("SELECT * FROM Comentarios WHERE PostagemId = ? ORDER BY DataHora DESC");
        $stmt->execute([$postagemId]);
        $results = array_map(function($c) {
            return [
                'id' => $c['Id'],
                'nome' => $c['Nome'],
                'texto' => $c['Texto'],
                'dataHora' => $c['DataHora']
            ];
        }, $stmt->fetchAll());
        echo json_encode($results);
    }

    public function create($postagemId, $data) {
        // Captcha validation
        $isValid = $this->validateCaptcha($data['captchaToken'] ?? '');
        if (!$isValid) {
            http_response_code(400);
            echo json_encode(['message' => 'Captcha inválido. Por favor, tente novamente.']);
            return;
        }

        if (empty($data['nome']) || empty($data['texto'])) {
            http_response_code(400);
            echo json_encode(['message' => 'Nome e comentário são obrigatórios.']);
            return;
        }

        $stmt = $this->db->prepare("INSERT INTO Comentarios (PostagemId, Nome, Texto, DataHora) VALUES (?, ?, ?, ?)");
        $dataHora = date('Y-m-d H:i:s');
        $stmt->execute([
            $postagemId,
            trim($data['nome']),
            trim($data['texto']),
            $dataHora
        ]);

        $id = $this->db->lastInsertId();
        echo json_encode([
            'id' => $id,
            'nome' => trim($data['nome']),
            'texto' => trim($data['texto']),
            'dataHora' => $dataHora
        ]);
    }

    public function delete($id) {
        if (!JwtHelper::validateToken(JwtHelper::getAuthToken())) {
            http_response_code(401);
            return;
        }

        $stmt = $this->db->prepare("DELETE FROM Comentarios WHERE Id = ?");
        $stmt->execute([$id]);
        http_response_code(204);
    }

    private function validateCaptcha($token) {
        if (empty($token)) return false;
        
        $data = [
            'secret' => HCAPTCHA_SECRET,
            'response' => $token
        ];

        $options = [
            'http' => [
                'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
                'method'  => 'POST',
                'content' => http_build_query($data)
            ]
        ];
        $context  = stream_context_create($options);
        $result = file_get_contents('https://hcaptcha.com/siteverify', false, $context);
        if ($result === false) return false;

        $response = json_decode($result);
        return $response->success;
    }
}
