<?php

namespace App;

class JwtHelper {
    public static function createToken($payload) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload['iss'] = JWT_ISSUER;
        $payload['aud'] = JWT_AUDIENCE;
        $payload['iat'] = time();
        $payload['exp'] = time() + JWT_EXPIRY;
        
        $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(json_encode($payload)));
        
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
        
        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    public static function validateToken($token) {
        $parts = explode('.', $token);
        if (count($parts) !== 3) return false;

        list($header64, $payload64, $signature64) = $parts;

        $signature = hash_hmac('sha256', $header64 . "." . $payload64, JWT_SECRET, true);
        $validSignature64 = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        if ($signature64 !== $validSignature64) return false;

        $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $payload64)), true);
        
        if (isset($payload['exp']) && $payload['exp'] < time()) return false;

        return $payload;
    }

    public static function getAuthToken() {
        $headers = getallheaders();
        if (isset($headers['Authorization'])) {
            if (preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
                return $matches[1];
            }
        }
        return null;
    }
}
