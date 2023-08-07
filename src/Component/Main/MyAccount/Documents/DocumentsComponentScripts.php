<?php

namespace App\MobileEntry\Component\Main\MyAccount\Documents;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;
use App\Drupal\Config;

/**
 *
 */
class DocumentsComponentScripts implements ComponentAttachmentInterface
{

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

        $documentConfig = $this->configFetcher->getConfig('my_account_config.documents_configuration');
        $genericErrorMessage = $documentConfig['submit_error'];
        $genericErrorMessagefailure = explode(PHP_EOL, $genericErrorMessage);
        $genericError = array();

        foreach ($genericErrorMessagefailure as $value) {
            [$newKey, $newValue] = explode("|", $value);
            $genericError[$newKey] = $newValue;
        }

        return [
            'submit_success' => $documentConfig['submit_success'],
            'genericError' => $genericError['failure']
            ?? 'Something went wrong. Please try again later: Error code (MDU01)',
        ];
    }
}
