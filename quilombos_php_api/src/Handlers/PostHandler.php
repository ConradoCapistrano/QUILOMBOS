<?php

namespace App\Handlers;

use App\Database;
use App\JwtHelper;
use PDO;
use Exception;

class PostHandler {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getAll($quilomboId, $page = 1, $pageSize = 10) {
        $offset = ($page - 1) * $pageSize;
        
        $sql = "SELECT p.*, q.Nome as QuilomboNome 
                FROM Postagens p 
                JOIN Quilombos q ON p.QuilomboId = q.Id";
        $params = [];
        
        if ($quilomboId) {
            $sql .= " WHERE p.QuilomboId = ?";
            $params[] = $quilomboId;
        }
        
        $sql .= " ORDER BY p.DataHora DESC LIMIT ? OFFSET ?";
        $params[] = (int)$pageSize;
        $params[] = (int)$offset;

        $stmt = $this->db->prepare($sql);
        foreach ($params as $k => $v) {
            $stmt->bindValue($k + 1, $v, is_int($v) ? PDO::PARAM_INT : PDO::PARAM_STR);
        }
        $stmt->execute();
        $posts = $stmt->fetchAll();

        $countSql = "SELECT COUNT(*) FROM Postagens";
        if ($quilomboId) $countSql .= " WHERE QuilomboId = ?";
        $stmtCount = $this->db->prepare($countSql);
        $stmtCount->execute($quilomboId ? [$quilomboId] : []);
        $total = $stmtCount->fetchColumn();

        $baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]";
        $data = array_map(function($p) use ($baseUrl) {
            return [
                'id' => $p['Id'],
                'quilomboId' => $p['QuilomboId'],
                'quilomboNome' => $p['QuilomboNome'],
                'titulo' => $p['Titulo'],
                'subtitulo' => $p['Subtitulo'],
                'dataHora' => $p['DataHora'],
                'imagemHeaderUrl' => $p['ImagemHeaderPath'] ? "$baseUrl/uploads/" . $p['ImagemHeaderPath'] : null
            ];
        }, $posts);

        echo json_encode([
            'total' => (int)$total,
            'page' => (int)$page,
            'pageSize' => (int)$pageSize,
            'data' => $data
        ]);
    }

    public function getById($id) {
        $stmt = $this->db->prepare("SELECT p.*, q.Nome as QuilomboNome FROM Postagens p JOIN Quilombos q ON p.QuilomboId = q.Id WHERE p.Id = ?");
        $stmt->execute([$id]);
        $p = $stmt->fetch();
        if (!$p) {
            http_response_code(404);
            return;
        }

        $stmtImg = $this->db->prepare("SELECT * FROM ImagensPostagem WHERE PostagemId = ? ORDER BY Ordem");
        $stmtImg->execute([$id]);
        $imagens = $stmtImg->fetchAll();

        $stmtCom = $this->db->prepare("SELECT * FROM Comentarios WHERE PostagemId = ? ORDER BY DataHora DESC");
        $stmtCom->execute([$id]);
        $comentarios = $stmtCom->fetchAll();

        $baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]";

        echo json_encode([
            'id' => $p['Id'],
            'quilomboId' => $p['QuilomboId'],
            'quilomboNome' => $p['QuilomboNome'],
            'titulo' => $p['Titulo'],
            'subtitulo' => $p['Subtitulo'],
            'texto' => $p['Texto'],
            'dataHora' => $p['DataHora'],
            'imagemHeaderUrl' => $p['ImagemHeaderPath'] ? "$baseUrl/uploads/" . $p['ImagemHeaderPath'] : null,
            'imagens' => array_map(function($img) use ($baseUrl) {
                return [
                    'id' => $img['Id'],
                    'url' => "$baseUrl/uploads/" . $img['Path'],
                    'nomeOriginal' => $img['NomeOriginal'],
                    'ordem' => $img['Ordem']
                ];
            }, $imagens),
            'comentarios' => array_map(function($c) {
                return [
                    'id' => $c['Id'],
                    'nome' => $c['Nome'],
                    'texto' => $c['Texto'],
                    'dataHora' => $c['DataHora']
                ];
            }, $comentarios)
        ]);
    }

    public function create($data, $files) {
        if (!JwtHelper::validateToken(JwtHelper::getAuthToken())) {
            http_response_code(401);
            return;
        }

        $this->db->beginTransaction();
        try {
            $headerPath = null;
            if (isset($files['imagemHeader']) && $files['imagemHeader']['error'] === UPLOAD_ERR_OK) {
                $headerPath = $this->saveFile($files['imagemHeader']);
            }

            $stmt = $this->db->prepare("INSERT INTO Postagens (QuilomboId, Titulo, Subtitulo, Texto, DataHora, ImagemHeaderPath) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $data['quilomboId'],
                $data['titulo'],
                $data['subtitulo'] ?? null,
                $data['texto'],
                date('Y-m-d H:i:s'),
                $headerPath
            ]);
            $postId = $this->db->lastInsertId();

            if (isset($files['imagens'])) {
                $ordem = 0;
                // Handle multiple files
                $filesArray = $this->reArrayFiles($files['imagens']);
                foreach ($filesArray as $file) {
                    if ($file['error'] === UPLOAD_ERR_OK) {
                        $path = $this->saveFile($file);
                        $stmtImg = $this->db->prepare("INSERT INTO ImagensPostagem (PostagemId, Path, NomeOriginal, Ordem) VALUES (?, ?, ?, ?)");
                        $stmtImg->execute([$postId, $path, $file['name'], $ordem++]);
                    }
                }
            }

            $this->db->commit();
            $this->getById($postId);
        } catch (Exception $e) {
            $this->db->rollBack();
            http_response_code(500);
            echo json_encode(['message' => $e->getMessage()]);
        }
    }

    public function delete($id) {
        if (!JwtHelper::validateToken(JwtHelper::getAuthToken())) {
            http_response_code(401);
            return;
        }

        $stmt = $this->db->prepare("SELECT ImagemHeaderPath FROM Postagens WHERE Id = ?");
        $stmt->execute([$id]);
        $headerPath = $stmt->fetchColumn();

        $stmtImg = $this->db->prepare("SELECT Path FROM ImagensPostagem WHERE PostagemId = ?");
        $stmtImg->execute([$id]);
        $paths = $stmtImg->fetchAll(PDO::FETCH_COLUMN);

        $this->db->beginTransaction();
        try {
            $this->db->prepare("DELETE FROM Postagens WHERE Id = ?")->execute([$id]);
            
            if ($headerPath && file_exists(UPLOADS_DIR . $headerPath)) unlink(UPLOADS_DIR . $headerPath);
            foreach ($paths as $path) {
                if (file_exists(UPLOADS_DIR . $path)) unlink(UPLOADS_DIR . $path);
            }

            $this->db->commit();
            http_response_code(204);
        } catch (Exception $e) {
            $this->db->rollBack();
            http_response_code(500);
        }
    }

    private function saveFile($file) {
        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $fileName = uniqid() . '.' . strtolower($ext);
        move_uploaded_file($file['tmp_name'], UPLOADS_DIR . $fileName);
        return $fileName;
    }

    private function reArrayFiles(&$file_post) {
        $file_ary = array();
        if (!isset($file_post['name'])) return $file_ary;
        if (is_string($file_post['name'])) {
            return [$file_post];
        }
        $file_count = count($file_post['name']);
        $file_keys = array_keys($file_post);
        for ($i=0; $i<$file_count; $i++) {
            foreach ($file_keys as $key) {
                $file_ary[$i][$key] = $file_post[$key][$i];
            }
        }
        return $file_ary;
    }
}
