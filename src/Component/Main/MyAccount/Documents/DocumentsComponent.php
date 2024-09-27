<?php

namespace App\MobileEntry\Component\Main\MyAccount\Documents;

use App\MobileEntry\Form\DocumentsForm;
use App\Plugins\ComponentWidget\ComponentWidgetInterface;
use App\Drupal\Config;

class DocumentsComponent implements ComponentWidgetInterface
{

    /**
     * Form manager object.
     */
    private $formManager;

    /**
     * Config Fetcher object.
     */
    private $configFetcher;

    /**
     * user Fetcher Object
     */
    private $userFetcher;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('form_manager'),
            $container->get('config_fetcher'),
            $container->get('user_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($formManager, $configFetcher, $userFetcher)
    {
        $this->formManager = $formManager;
        $this->configFetcher = $configFetcher->withProduct('account');
        $this->userFetcher = $userFetcher;
    }

    /**
     * {@inheritdoc}
     */
    public function getTemplate()
    {
        return '@component/Main/MyAccount/Documents/template.html.twig';
    }

    /**
     * {@inheritdoc}
     */
    public function getData()
    {
        $formDocuments = $this->formManager->getForm(DocumentsForm::class);
        try {
            /**
             * Fetches the documents configuration
             * @var array $documentsConfig
             */
            $documentsConfig = $this->configFetcher->getConfig('my_account_config.documents_configuration');
            $statusMapping = Config::parse($documentsConfig['document_status'] ?? '');
            $documentsEnabled = $documentsConfig['enabled'] ?? 0;
            /**
             * If the @var integer $documentsConfig['enabled'] is 1
             * Continue to fetching of the document status from iCore
             */
            if ($documentsEnabled) {
                /**
                 * Fetches the document status from iCore
                 * @var array $documentStatus
                 * @var string $documentStatus['Status']
                 * 1 - No Action Required
                 * 2 - Pending Upload
                 * 3 - Under Review
                 * 4 - Verified
                 * 5 - Rejected
                 */
                $documentStatus = $this->userFetcher->getDocumentStatus();

                $statusCode = $documentStatus['Status'] ?? "Error";
                $genericError = 'Something went wrong. Please try again later: Error code (DS0' . $statusCode .')';
                $msg = $statusMapping[$statusCode] ?? $genericError;

                /**
                 * If the status is 2 (Pending Upload)
                 */
                $showDocumentStatus = false;
                if ($documentStatus['Status'] != 2) {
                    $showDocumentStatus = true;
                }
            }
        } catch (\Throwable $th) {
            $documentsEnabled = false;
        }

        return [
            'formDocuments' => $formDocuments->createView(),
            'successMessage' => 'Submitted successfully',
            'failedMessage' => 'Failed to submit',
            'showDocumentStatus' => $showDocumentStatus ?? false,
            'backText' => $documentsConfig['back'] ?? 'Back',
            'documentStatusMessage' => $msg,
        ];
    }
}
