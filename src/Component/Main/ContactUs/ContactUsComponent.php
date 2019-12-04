<?php

namespace App\MobileEntry\Component\Main\ContactUs;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;
use App\MobileEntry\Form\ContactUsForm;

class ContactUsComponent implements ComponentWidgetInterface
{
    /**
     * Config Fetcher object.
     */
    private $configFetcher;

    /**
     * user Fetcher Object
     */
    private $formManager;

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
        $this->configFetcher = $configFetcher;
        $this->userFetcher = $userFetcher;
    }

    /**
     * {@inheritdoc}
     */
    public function getTemplate()
    {
        return '@component/Main/ContactUs/template.html.twig';
    }

    /**
     * {@inheritdoc}
     */
    public function getData()
    {
        $contactUsForm = $this->formManager->getForm(ContactUsForm::class);
        // $config = $this->configFetcher->getConfigById('my_account_change_password');
        // $successMessage = $config['change_password_mobile_success_message']['value'] ?? '';
        // $fialedMessage = $config['change_password_mobile_failed_message']['value'] ?? '';

        return [
            'contactUsForm' => $contactUsForm->createView(),
            // 'successMessage' => $successMessage,
            // 'fialedMessage' => $fialedMessage
        ];
    }
}
