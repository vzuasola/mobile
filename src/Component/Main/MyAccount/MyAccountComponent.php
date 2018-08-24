<?php

namespace App\MobileEntry\Component\Main\MyAccount;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;
use App\MobileEntry\Form\ForgotPasswordForm;
use App\MobileEntry\Form\ForgotUsernameForm;
use App\MobileEntry\Form\ResetPasswordForm;

class MyAccountComponent implements ComponentWidgetInterface
{
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
        return '@component/Main/MyAccount/template.html.twig';
    }

    /**
     * {@inheritdoc}
     */
    public function getData()
    {
        $myProfileConfig = $this->configFetcher->getConfigById('my_account_profile_general_configuration');

        return [
            'myProfileTab' => $myProfileConfig['my_profile_tab'] ?? 'My Profile',
            'changePasswordTab' => $myProfileConfig['change_password_tab'] ?? 'Change Password',
        ];
    }
}
