<?php

require_once __DIR__ . '/config.php';

// Simple Autoloader
spl_autoload_register(function ($class) {
    if (strpos($class, 'App\\') === 0) {
        $path = __DIR__ . '/src/' . str_replace('\\', '/', substr($class, 4)) . '.php';
        if (file_exists($path)) {
            require_once $path;
        }
    }
});

// Headers
header("Access-Control-Allow-Origin: " . ($_SERVER['HTTP_ORIGIN'] ?? '*'));
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// Request URI and Method
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Handle /api prefix if present (for local testing or specific hosting)
$uri = preg_replace('/^.*\/api\//', '/', $uri);
if ($uri === $_SERVER['REQUEST_URI']) {
    $uri = str_replace('/quilombos_php_api/', '/', $uri);
}

// Map endpoints
$data = json_decode(file_get_contents('php://input'), true) ?? $_POST;

try {
    // Auth
    if ($uri === '/auth/login' && $method === 'POST') {
        (new App\Handlers\AuthHandler())->login($data);
    } elseif ($uri === '/auth/credenciais' && $method === 'PUT') {
        (new App\Handlers\AuthHandler())->alterarCredenciais($data);
    }
    
    // Quilombos
    elseif ($uri === '/quilombos' && $method === 'GET') {
        (new App\Handlers\QuilomboHandler())->getAll();
    } elseif (preg_match('/^\/quilombos\/(\d+)$/', $uri, $matches) && $method === 'GET') {
        (new App\Handlers\QuilomboHandler())->getById($matches[1]);
    } elseif ($uri === '/quilombos' && $method === 'POST') {
        (new App\Handlers\QuilomboHandler())->create($data);
    } elseif (preg_match('/^\/quilombos\/(\d+)$/', $uri, $matches) && $method === 'PUT') {
        (new App\Handlers\QuilomboHandler())->update($matches[1], $data);
    } elseif (preg_match('/^\/quilombos\/(\d+)$/', $uri, $matches) && $method === 'DELETE') {
        (new App\Handlers\QuilomboHandler())->delete($matches[1]);
    }
    
    // Postagens
    elseif ($uri === '/postagens' && $method === 'GET') {
        $quilomboId = $_GET['quilomboId'] ?? null;
        $page = $_GET['page'] ?? 1;
        $pageSize = $_GET['pageSize'] ?? 10;
        (new App\Handlers\PostHandler())->getAll($quilomboId, $page, $pageSize);
    } elseif (preg_match('/^\/postagens\/(\d+)$/', $uri, $matches) && $method === 'GET') {
        (new App\Handlers\PostHandler())->getById($matches[1]);
    } elseif ($uri === '/postagens' && $method === 'POST') {
        (new App\Handlers\PostHandler())->create($data, $_FILES);
    } elseif (preg_match('/^\/postagens\/(\d+)$/', $uri, $matches) && $method === 'DELETE') {
        (new App\Handlers\PostHandler())->delete($matches[1]);
    }
    
    // Comentarios
    elseif (preg_match('/^\/postagens\/(\d+)\/comentarios$/', $uri, $matches)) {
        if ($method === 'GET') {
            (new App\Handlers\CommentHandler())->getByPostagem($matches[1]);
        } elseif ($method === 'POST') {
            (new App\Handlers\CommentHandler())->create($matches[1], $data);
        }
    } elseif (preg_match('/^\/comentarios\/(\d+)$/', $uri, $matches) && $method === 'DELETE') {
        (new App\Handlers\CommentHandler())->delete($matches[1]);
    }
    
    else {
        http_response_code(404);
        echo json_encode(['message' => 'Not Found', 'uri' => $uri]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['message' => $e->getMessage()]);
}
