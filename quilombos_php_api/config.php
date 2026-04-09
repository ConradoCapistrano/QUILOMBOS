<?php

// Database Configuration
define('DB_PATH', __DIR__ . '/../quilombos_api/quilombos_blog.db');

// JWT Configuration
define('JWT_SECRET', 'quilombos-sertao-pernambucano-jwt-secret-key-2026!');
define('JWT_ISSUER', 'quilombos_api');
define('JWT_AUDIENCE', 'quilombos_front');
define('JWT_EXPIRY', 8 * 3600); // 8 hours

// HCaptcha Configuration
define('HCAPTCHA_SECRET', '0x0000000000000000000000000000000000000000');

// CORS Configuration
define('ALLOWED_ORIGINS', [
    'http://localhost:4200',
    'http://localhost:4201'
]);

// Uploads Configuration
define('UPLOADS_DIR', __DIR__ . '/uploads/');

// Master Password
define('MASTER_PASSWORD', 'RIOMAR15');
