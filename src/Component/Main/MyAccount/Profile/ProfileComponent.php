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
        return '@component/Main/MyAccount/MyProfile/template.html.twig';
    }

    /**
     * {@inheritdoc}
     */
    public function getData()
    {
        $data = [];
        $formForgotPassword = $this->formManager->getForm(MyProfileForm::class);
        $data['formMyProfile'] = $formForgotPassword->createView();
        d($data);
        return $data;
    }
}
