<?php

namespace App\MobileEntry\Component\Main\CantLogin\ForgotUsername;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;
use App\Drupal\Config;

/**
 *
 */
class ForgotUsernameComponentScripts implements ComponentAttachmentInterface
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
            $container->get('config_fetcher')
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

        $config = $this->configFetcher->getConfigById('cant_login');
        $integrationError = Config::parse($config['cant_login_response_mapping']) ?? '';

        return [
            'messages' => $integrationError
        ];
    }
}
