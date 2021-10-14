<?php

// Site specific settings

require APP_ROOT . '/core/app/settings.php';

$settings['settings']['languages']['supply_languages_list'] = [];

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
$settings['settings']['components']['render']['preload'] = [
    'profiler',
    'footer',
    'marketing',
    'seo',
    'meta'
];

$settings['settings']['components']['router']['widget_headers'] = [
    'Cache-Control' => 'private, max-age=300',
];

// Cache

$settings['settings']['cache']['default_timeout'] = 1800;

// Page Cache

$settings['settings']['page_cache']['enable'] = true;
$settings['settings']['page_cache']['default_timeout'] = 1800;

// Fetchers

$settings['settings']['fetchers']['enable_permanent_caching'] = true;

// Sessions

$settings['settings']['session']['lazy'] = true; // Do not start session unless writing information
//Session time out
$settings['settings']['session_handler']['handler_options'] = [
    'clients' => 'tcp://10.5.0.7:6379',
    'options' => [
        'parameters' => ['database' => 2],
        'prefix' => "session:front:",
    ],
    'parameters' => [
        'gc_probability' => 1,
        'gc_divisor' => 100,
        'gc_maxlifetime' => 7200,
    ]
];


// Environment Specific

if (\App\Kernel::environment() === 'DEV') {
    $settings['settings']['page_cache']['enable'] = false;
}

if (\App\Kernel::environment() !== 'DEV') {
    $settings['settings']['asset']['prefixed_drupal'] = true;
}
