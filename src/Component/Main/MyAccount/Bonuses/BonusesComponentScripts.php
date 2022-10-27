<?php

namespace App\MobileEntry\Component\Main\MyAccount\Profile;

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
    public function __construct($userFetcher, $playerSubscription, $configFetcher, $tokenParser, $playerSession)
    {
        $this->configFetcher = $configFetcher->withProduct('account');
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        $config = $this->configFetcher->getConfig('webcomposer_config.bonus_code_configuration');
        return [
            'invalid_bonus_code' => $config['invalid_code'],
            'bonus_code_success' => $config['success_messsage']['value'],
            'default_error_message' => $config['default_error_message'],
        ];
    }
}
