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
        $formMyProfile = $this->formManager->getForm(MyProfileForm::class);
        $myProfileConfig = $this->configFetcher->getConfigById('my_account_profile_general_configuration');
        $smsConfig = $this->configFetcher->getConfigById('my_account_sms_verification');

        return [
            'title' => 'My Account',
            'formMyProfile' => $formMyProfile->createView(),
            'addMobileLabel' => $myProfileConfig['add_mobile_label'] ?? 'Add Mobile',
            'modalVerifyHeaderText' => $smsConfig['modal_verify_header_text'] ?? 'Verify Number',
            'modalVerifyBodyText' => $smsConfig['modal_verify_body_text'] ?? 'Verify your mobile number',
            'modalVerificationCodePlaceholder' => $smsConfig['modal_verification_code_placeholder'] ?? 'Code',
            'modalVerificationResendCodeText' => $smsConfig['modal_verification_resend_code_text'] ?? 'Resend',
            'modalVerificationSubmitText' => $smsConfig['modal_verification_submit_text'] ?? 'Submit',
            'verifyText' => $smsConfig['verifyText'] ?? 'Verify',
        ];
    }
}
