<?php

namespace App\MobileEntry\Component\Main\MyAccount\Profile;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;
use App\MobileEntry\Form\MyProfileForm;

class ProfileComponent implements ComponentWidgetInterface
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
        return '@component/Main/MyAccount/Profile/template.html.twig';
    }

    /**
     * {@inheritdoc}
     */
    public function getData()
    {
        $data = [];
        $formMyProfile = $this->formManager->getForm(MyProfileForm::class);
        $data['config']['general'] = $this->configFetcher->getConfigById('my_account_profile_general_configuration');
        $data['config']['sms'] = $this->configFetcher->getConfigById('my_account_sms_verification');
        $data['title'] = 'My Account';
        $data['formMyProfile'] = $formMyProfile->createView();

        return $data;
    }
}
