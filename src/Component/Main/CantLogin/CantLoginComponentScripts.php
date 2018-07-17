<?php

namespace App\MobileEntry\Component\Main\CantLogin;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;
use App\Drupal\Config;
use App\Async\Async;

/**
 *
 */
class CantLoginComponentScripts implements ComponentAttachmentInterface
{

    /**
     * Config Fetcher Object.
     */
    private $configFetcher;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('config_fetcher_async')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($configFetcher)
    {
        $this->configFetcher = $configFetcher->withProduct('account');
    }
    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        $config = [
            'cant_login_config' => $this->configFetcher->getConfigById('cant_login')
        ];
        $data = Async::resolve($config);
        $integrationError = Config::parse($data['cant_login_config']['cant_login_response_mapping']) ?? '';

        return [
            'username' => 'leandrew',
            'messages' => $integrationError
        ];
    }
}
