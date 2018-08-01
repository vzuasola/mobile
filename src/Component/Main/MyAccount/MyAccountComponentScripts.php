<?php

namespace App\MobileEntry\Component\Main\CantLogin;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;
use App\Drupal\Config;

/**
 *
 */
class MyAccountComponentScripts implements ComponentAttachmentInterface
{

    /**
     * Config Fetcher Object.
     */
    private $configFetcher;

    /**
     * Translation Manager Object.
     */
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
        return [
            'messages' => [],
        ];
    }
}
