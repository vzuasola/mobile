<?php

namespace App\MobileEntry\Component\Main\MyAccount\Documents;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;
use App\Drupal\Config;

/**
 *
 */
class DocumentsComponentScripts implements ComponentAttachmentInterface
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
        // $this->configFetcher = $configFetcher->withProduct('account');
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {

        return [];
    }
}
