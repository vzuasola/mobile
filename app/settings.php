<?php

// Site specific settings

require APP_ROOT . '/core/app/settings.php';

$settings['settings']['configurations']['inheritance'] = false;

$settings['settings']['renderer']['template_path']['app'] = __DIR__ . '/../';
$settings['settings']['renderer']['template_path']['site'] = __DIR__ . '/../templates';
$settings['settings']['renderer']['template_path']['component'] = __DIR__ . '/../src/Component';

$settings['settings']['product'] = 'mobile-entrypage';

$settings['settings']['dafaconnect']['enable'] = true;

$settings['settings']['asset']['prefixed'] = false;

$settings['settings']['components']['async'] = false;

if (\App\Kernel::environment() !== 'DEV') {
    $settings['settings']['asset']['prefixed_drupal'] = true;
}
