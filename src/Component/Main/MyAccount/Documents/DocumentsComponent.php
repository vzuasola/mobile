<?php

namespace App\MobileEntry\Component\Main\MyAccount\Documents;

use App\MobileEntry\Form\DocumentsForm;
use App\Plugins\ComponentWidget\ComponentWidgetInterface;

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
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('form_manager'),
            $container->get('config_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($formManager, $configFetcher)
    {
        $this->formManager = $formManager;
        $this->configFetcher = $configFetcher->withProduct('account');
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
//        $config = $this->configFetcher->getConfigById('my_account_change_password');
//        $successMessage = $config['change_password_mobile_success_message']['value'] ?? '';
//        $fialedMessage = $config['change_password_mobile_failed_message']['value'] ?? '';

        return [
            'formDocuments' => $formDocuments->createView(),
            'successMessage' => 'Submitted successfully',
            'failedMessage' => 'Failed to submit'
        ];
    }
}
