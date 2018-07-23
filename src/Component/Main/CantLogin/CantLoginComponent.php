<?php

namespace App\MobileEntry\Component\Main\CantLogin;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;
use App\MobileEntry\Form\ForgotPasswordForm;
use App\MobileEntry\Form\ForgotUsernameForm;
use App\MobileEntry\Form\ResetPasswordForm;

class CantLoginComponent implements ComponentWidgetInterface
{

    /**
     * Form manager object.
     */
    private $formManager;

    /**
     * Request Object.
     */
    private $request;

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
            $container->get('request'),
            $container->get('form_manager'),
            $container->get('config_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($request, $formManager, $configFetcher)
    {
        $this->formManager = $formManager;
        $this->request = $request;
        $this->configFetcher = $configFetcher->withProduct('account');
    }

    /**
     * {@inheritdoc}
     */
    public function getTemplate()
    {
        return '@component/Main/CantLogin/template.html.twig';
    }

    /**
     * {@inheritdoc}
     */
    public function getData()
    {
        $config = $this->configFetcher->getConfigById('cant_login');
        $data = [
            'title_forgot' => $config['cant_login_title'] ?? 'Cannot Access your Dafabet Account?',
            'title_reset' => $config['reset_title'] ?? 'Password Reset Request',
            'password_link' => $config['forgot_password_link'] ?? '#forgot-password-content',
            'password_tab_menu' => $config['forgot_password_tab_menu'] ?? 'Forgot Password',
            'username_link' => $config['forgot_username_link'] ?? 'Forgot Username',
            'username_tab_menu' => $config['forgot_username_tab_menu'] ?? '#forgot-username-content',
            'password_success_message' => $config['mobile_forgot_password_success_message']['value'] ?? '',
            'username_success_message' => $config['mobile_forgot_username_success_message']['value'] ?? '',
            'reset_password_success_message' => $config['mobile_reset_password_success_message']['value'] ?? ''
        ];
        $this->cantLoginGetForm($data);
        return $data;
    }

    /**
     * Get forms.
     */
    private function cantLoginGetForm(&$data)
    {
        $sbfpw = $this->request->getQueryParam('sbfpw');
        if (isset($sbfpw)) {
            $formResetPassword = $this->formManager->getForm(ResetPasswordForm::class);

            $data['formResetPassword'] = $formResetPassword->createView();
            $data['isResetPassword'] = true;
        } else {
            $formForgotPassword = $this->formManager->getForm(ForgotPasswordForm::class);
            $formForgotUsername = $this->formManager->getForm(ForgotUsernameForm::class);

            $data['formForgotPassword'] = $formForgotPassword->createView();
            $data['formForgotUsername'] = $formForgotUsername->createView();
            $data['isResetPassword'] = false;
        }
    }
}
