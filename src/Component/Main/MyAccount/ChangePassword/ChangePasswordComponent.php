<?php

namespace App\MobileEntry\Component\Main\MyAccount\ChangePassword;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;
use App\MobileEntry\Form\ChangePasswordForm;

class ChangePasswordComponent implements ComponentWidgetInterface
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
        return '@component/Main/MyAccouunt/ChangePassword/template.html.twig';
    }

    /**
     * {@inheritdoc}
     */
    public function getData()
    {
        $data = [];
        $formResetPassword = $this->formManager->getForm(ChangePasswordForm::class);
        $data['formResetPassword'] = $formResetPassword->createView();
        return $data;
    }
}
