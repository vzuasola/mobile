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

// Page Cache

$settings['settings']['page_cache']['enable'] = true;
$settings['settings']['page_cache']['default_timeout'] = 1000;

// Environment Specific

if (\App\Kernel::environment() !== 'DEV') {
    $settings['settings']['asset']['prefixed_drupal'] = true;
}
