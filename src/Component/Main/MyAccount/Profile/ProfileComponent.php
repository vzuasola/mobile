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
        $data['config'] = $this->configFetcher->getConfigById('my_account_sms_verification');
        $data['config']['general'] = $this->configFetcher->getConfigById('my_account_profile_general_configuration');

        return [
            'title' => 'My Account',
            'formMyProfile' => $formMyProfile->createView(),
            'add_mobile_label' => $data['config']['general']['add_mobile_label'],
            'modal_verify_header_text' => $data['config']['modal_verify_header_text'],
            'modal_verify_body_text' => $data['config']['modal_verify_body_text'],
            'modal_verification_code_placeholder' => $data['config']['modal_verification_code_placeholder'],
            'modal_verification_resend_code_text' => $data['config']['modal_verification_resend_code_text'],
            'modal_verification_submit_text' => $data['config']['modal_verification_submit_text'],
            'verify_text' => $data['config']['verify_text'],
        ];
    }
}
