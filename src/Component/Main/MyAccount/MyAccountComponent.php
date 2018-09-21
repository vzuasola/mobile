<?php

namespace App\MobileEntry\Component\Main\MyAccount;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class MyAccountComponent implements ComponentWidgetInterface
{
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
        return '@component/Main/MyAccount/template.html.twig';
    }

    /**
     * {@inheritdoc}
     */
    public function getData()
    {
        $myProfileConfig = $this->configFetcher->getConfigById('my_account_profile_general_configuration');
        $user = $this->userFetcher->getPlayerDetails();
        $flashMessage = "";
        $isFastReg = false;

        if (strtoupper($user['firstName']) == "FIRST NAME" ||
            strtoupper($user['lastName']) == "LAST NAME"
        ) {
            $flashMessage = $myProfileConfig['fast_reg_flash_message']['value'] ?? "";
            $isFastReg = true;
        }

        return [
            'myProfileTab' => $myProfileConfig['my_profile_tab'] ?? 'My Profile',
            'changePasswordTab' => $myProfileConfig['change_password_tab'] ?? 'Change Password',
            'isFastReg' => $isFastReg,
            'flashMessage' => $flashMessage,
        ];
    }
}
