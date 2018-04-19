<?php

// Site specific settings

require APP_ROOT . '/core/app/settings.php';

$settings['settings']['debug'] = true;
$settings['settings']['configurations']['inheritance'] = false;

$settings['settings']['renderer']['template_path']['site'] = __DIR__ . '/../templates';
$settings['settings']['renderer']['template_path']['component'] = __DIR__ . '/../src/Component';

$settings['settings']['product'] = 'mobile-entrypage';
// $settings['settings']['product_url'] = ['demo'];

$settings['settings']['asset']['prefixed'] = false;
// $settings['settings']['asset']['product_prefix'] = 'demo';

// Tracking

$settings['settings']['tracking']['enable'] = true;
