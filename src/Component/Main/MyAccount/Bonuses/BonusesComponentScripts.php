<?php

namespace App\MobileEntry\Component\Main\MyAccount\Bonuses;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;
use App\Drupal\Config;

/**
 *
 */
class BonusesComponentScripts implements ComponentAttachmentInterface
{
    /**
     * Fetcher
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
        $config = $this->configFetcher->getConfig('webcomposer_config.bonus_code_configuration');
        $configRateLimit = $this->configFetcher->getConfigById('rate_limit');
        return [
            'invalid_bonus_code' => $config['invalid_code'],
            'default_error_message' => $config['default_error_message'],
            'rate_limit_error' => $configRateLimit['rate_limit_bonus_code_error_message'],
        ];
    }
}
