<?php

namespace App\Handlers;

use App\Database;
use App\JwtHelper;
use PDO;

class QuilomboHandler {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getAll() {
        $stmt = $this->db->query("SELECT * FROM Quilombos ORDER BY Codigo");
        $results = $stmt->fetchAll();
        echo json_encode($results);
    }

    public function getById($id) {
        $stmt = $this->db->prepare("SELECT * FROM Quilombos WHERE Id = ?");
        $stmt->execute([$id]);
        $result = $stmt->fetch();
        if (!$result) {
            http_response_code(404);
            return;
        }
        echo json_encode($result);
    }

    public function create($data) {
        if (!JwtHelper::validateToken(JwtHelper::getAuthToken())) {
            http_response_code(401);
            return;
        }

        $stmt = $this->db->query("SELECT MAX(Codigo) FROM Quilombos");
        $maxCode = $stmt->fetchColumn() ?: 0;
        $nextCode = $maxCode + 1;

        $stmt = $this->db->prepare("INSERT INTO Quilombos (Codigo, Nome, Regiao, Municipio, Ano, Familias, Descricao, ImagemUrl, Historia, Cultura, Territorio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $nextCode,
            $data['nome'],
            $data['regiao'],
            $data['municipio'],
            $data['ano'],
            $data['familias'],
            $data['descricao'],
            $data['imagemUrl'],
            $data['historia'],
            $data['cultura'],
            $data['territorio']
        ]);

        $id = $this->db->lastInsertId();
        $this->getById($id);
    }

    public function update($id, $data) {
        if (!JwtHelper::validateToken(JwtHelper::getAuthToken())) {
            http_response_code(401);
            return;
        }

        $stmt = $this->db->prepare("UPDATE Quilombos SET Nome = ?, Regiao = ?, Municipio = ?, Ano = ?, Familias = ?, Descricao = ?, ImagemUrl = ?, Historia = ?, Cultura = ?, Territorio = ? WHERE Id = ?");
        $stmt->execute([
            $data['nome'],
            $data['regiao'],
            $data['municipio'],
            $data['ano'],
            $data['familias'],
            $data['descricao'],
            $data['imagemUrl'],
            $data['historia'],
            $data['cultura'],
            $data['territorio'],
            $id
        ]);

        $this->getById($id);
    }

    public function delete($id) {
        if (!JwtHelper::validateToken(JwtHelper::getAuthToken())) {
            http_response_code(401);
            return;
        }

        $stmt = $this->db->prepare("DELETE FROM Quilombos WHERE Id = ?");
        $stmt->execute([$id]);
        http_response_code(204);
    }
}
