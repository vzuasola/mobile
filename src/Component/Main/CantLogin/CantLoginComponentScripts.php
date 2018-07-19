<?php

namespace App\MobileEntry\Component\Main\CantLogin;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;
use App\Drupal\Config;

/**
 *
 */
class CantLoginComponentScripts implements ComponentAttachmentInterface
{

    /**
     * Config Fetcher Object.
     */
    private $configFetcher;

    private $translationManager;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('config_fetcher'),
            $container->get('translation_manager')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($configFetcher, $translationManager)
    {
        $this->configFetcher = $configFetcher->withProduct('account');
        $this->translationManager = $translationManager;
    }
    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {

        $config = $this->configFetcher->getConfigById('cant_login');
        $integrationError = Config::parse($config['cant_login_response_mapping']) ?? '';
        $test = $this->translationManager->getTranslation('password-strength-meter');

        return [
            'messages' => $integrationError,
            'passwordStrengthMeter' => $test
        ];
    }
}
