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
        $data = [];
        $config = $this->configFetcher->getConfigById('cant_login');
        $data['config'] = $config;
        $data['title'] = $config['page_subtitle'];

        $this->cantLoginGetForm($data);
        return $data;
    }

    /**
     * Get forms.
     */
    private function cantLoginGetForm(&$data)
    {
        if (is_null($this->request->getQueryParam('sbfpw'))) {
            $formForgotPassword = $this->formManager->getForm(ForgotPasswordForm::class);
            $formForgotUsername = $this->formManager->getForm(ForgotUsernameForm::class);

            $data['formForgotPassword'] = $formForgotPassword->createView();
            $data['formForgotUsername'] = $formForgotUsername->createView();
            $data['isResetPassword'] = false;
        } else {
            $formResetPassword = $this->formManager->getForm(ResetPasswordForm::class);
            $data['formResetPassword'] = $formResetPassword->createView();
            $data['isResetPassword'] = true;
        }
    }
}
