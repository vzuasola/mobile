<?php

namespace App\MobileEntry\Component\Main\CantLogin\ForgotUsername;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;
use App\MobileEntry\Form\ForgotUsernameForm;

class ForgotUsernameComponent implements ComponentWidgetInterface
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
        return '@component/Main/CantLogin/ForgotUsername/template.html.twig';
    }

    /**
     * {@inheritdoc}
     */
    public function getData()
    {
        $data = [];

        $config = $this->configFetcher->getConfigById('cant_login');
        $formForgotUsername = $this->formManager->getForm(ForgotUsernameForm::class);

        $data['username_success_message'] = $config['native_app_mobile_forgot_username_success_message']['value']
            ?? "Retrieve Username Request Sent";
        $data['formForgotUsername'] = $formForgotUsername->createView();

        return $data;
    }
}
