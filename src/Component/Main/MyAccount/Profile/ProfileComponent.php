<?php

namespace App\MobileEntry\Component\Main\MyAccount\Profile;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;
use App\MobileEntry\Form\MyProfileForm;
use App\MobileEntry\Form\SmsVerificationForm;

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
        $SmsVerificationForm = $this->formManager->getForm(SmsVerificationForm::class);
        $accountConfig = $this->configFetcher->getConfig('my_account_config.general_configuration');
        if ($accountConfig && $accountConfig['enable_sms_verification']) {
            $config = $accountConfig;
        } else {
            $myProfileConfig = $this->configFetcher->getConfigById('my_account_profile_general_configuration');
            $smsConfig = $this->configFetcher->getConfigById('my_account_sms_verification');
            $config = array_merge($myProfileConfig, $smsConfig);
        }

        return [
            'title' => $config['mp_page_title'] ?? 'My Profileee',
            'formMyProfile' => $formMyProfile->createView(),
            'SmsVerificationForm' => $SmsVerificationForm->createView(),
            'addMobileLabel' => $config['add_mobile_label'] ?? 'Add Mobile',
            'modalVerifyHeaderText' => $config['modal_verify_header_text'] ?? 'Verify Number',
            'modalVerifyBodyText' => $config['modal_verify_body_text'] ?? 'Verify your mobile number',
            'modalVerificationCodePlaceholder' => $config['modal_verification_code_placeholder'] ?? 'Code',
            'modalVerificationResendCodeText' => $config['modal_verification_resend_code_text'] ?? 'Resend',
            'modalVerificationSubmitText' => $config['modal_verification_submit_text'] ?? 'Submit',
            'enableSmsVerification' => $config['enable_sms_verification'],
            'verifyText' => $config['verify_text'] ?? 'Verify',
        ];
    }
}
