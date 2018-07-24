<?php

namespace App\MobileEntry\Component\Main\CantLogin\ForgotPassword;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;
use App\MobileEntry\Form\ForgotPasswordForm;

class ForgotPasswordComponent implements ComponentWidgetInterface
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
        return '@component/Main/CantLogin/ForgotPassword/template.html.twig';
    }

    /**
     * {@inheritdoc}
     */
    public function getData()
    {
        $data = [];
        $config = $this->configFetcher->getConfigById('cant_login');
        $formForgotPassword = $this->formManager->getForm(ForgotPasswordForm::class);

        $data['password_success_message'] = $config['mobile_forgot_password_success_message']['value'] ?? '';
        $data['formForgotPassword'] = $formForgotPassword->createView();
        return $data;
    }
}
