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
     * @var \App\Fetcher\Integration\UserFetcher $userFetcher User Fetcher Object
     */
    private $userFetcher;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('config_fetcher'),
            $container->get('user_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($configFetcher, $userFetcher)
    {
        $this->configFetcher = $configFetcher->withProduct('account');
        $this->userFetcher = $userFetcher;
    }
    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {

        $documentConfig = $this->configFetcher->getConfig('my_account_config.documents_configuration');
        $genericErrorMessage = $documentConfig['submit_error'];
        $genericError = array();
        $documentStatus = $this->userFetcher->getDocumentStatus();

        /**
         * If the status is 2 (Pending Upload)
         */
        $disabledDocumentFields = false;
        if ($documentStatus['Status'] != 2) {
            $disabledDocumentFields = true;
        }

        $genericError = Config::parse($genericErrorMessage ?? '');

        return [
            'submit_success' => $documentConfig['submit_success'],
            'genericError' => $genericError['failure']
            ?? 'Something went wrong. Please try again later: Error code (MDU01)',
            'documentStatus' => $disabledDocumentFields ?? false,
        ];
    }
}
