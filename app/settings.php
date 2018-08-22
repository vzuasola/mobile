<?php

// Site specific settings

require APP_ROOT . '/core/app/settings.php';

$settings['settings']['configurations']['inheritance'] = false;

// Twig

$settings['settings']['renderer']['template_path']['app'] = __DIR__ . '/../';
$settings['settings']['renderer']['template_path']['site'] = __DIR__ . '/../templates';
$settings['settings']['renderer']['template_path']['component'] = __DIR__ . '/../src/Component';

// Product

$settings['settings']['product'] = 'mobile-entrypage';
$settings['settings']['dafaconnect']['enable'] = true;

// URL

$settings['settings']['asset']['prefixed'] = false;

// Component Behavior

$settings['settings']['components']['async'] = false;

$settings['settings']['components']['render']['mode'] = 'prerender';
$settings['settings']['components']['render']['preload'] = ['profiler', 'footer', 'marketing', 'backtotop'];

$settings['settings']['components']['router']['widget_headers'] = [
    'Cache-Control' => 'private, max-age=300',
];

// Cache

// $settings['settings']['cache']['default_timeout'] = 1800;

// Page Cache

// $settings['settings']['page_cache']['enable'] = true;
// $settings['settings']['page_cache']['default_timeout'] = 1800;

// Fetchers

// $settings['settings']['fetchers']['enable_permanent_caching'] = true;

// Environment Specific

if (\App\Kernel::environment() === 'DEV') {
    $settings['settings']['page_cache']['enable'] = false;
}

if (\App\Kernel::environment() !== 'DEV') {
    $settings['settings']['asset']['prefixed_drupal'] = true;
}
