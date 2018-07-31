<?php

namespace App\MobileEntry\Component\Main\CantLogin\ResetPassword;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;
use App\MobileEntry\Form\ResetPasswordForm;

class ResetPasswordComponent implements ComponentWidgetInterface
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
        return '@component/Main/CantLogin/ResetPassword/template.html.twig';
    }

    /**
     * {@inheritdoc}
     */
    public function getData()
    {
        $data = [];
        $config = $this->configFetcher->getConfigById('cant_login');
        $formResetPassword = $this->formManager->getForm(ResetPasswordForm::class);
        $defVal = "Reset Password Success";

        $data['reset_password_success_message'] = $config['mobile_reset_password_success_message']['value'] ?? $defVal;
        $data['formResetPassword'] = $formResetPassword->createView();
        return $data;
    }
}
