<?php

namespace App\MobileEntry\Component\Main\CantLogin;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;
use App\MobileEntry\Form\ForgotPasswordForm;
use App\MobileEntry\Form\ForgotUsernameForm;
use App\MobileEntry\Form\ResetPasswordForm;
use App\Async\Async;

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
            $container->get('config_fetcher_async')
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
        $config = $this->getConfig();
        $data['config'] = $config;
        $data['title'] = $config['cant_login_config']['page_subtitle'];

        $this->cantLoginGetForm($data);
        return $data;
    }

    /**
     * Get forms.
     */
    private function cantLoginGetForm(&$data)
    {
        if (is_null($this->request->getQueryParam('sbfpw'))) {
            $formForgotPassword = $this->formManager->getForm(
                ForgotPasswordForm::class,
                ['attachValidationOnFormTag' => true]
            );
            $formForgotUsername = $this->formManager->getForm(
                ForgotUsernameForm::class,
                ['attachValidationOnFormTag' => true]
            );

            $data['formForgotPassword'] = $formForgotPassword->createView();
            $data['formForgotUsername'] = $formForgotUsername->createView();
            $data['isResetPassword'] = false;
        } else {
            $formResetPassword = $this->formManager->getForm(
                ResetPasswordForm::class,
                ['attachValidationOnFormTag' => true]
            );
            $data['formResetPassword'] = $formResetPassword->createView();
            $data['isResetPassword'] = true;
        }
    }

    /**
     * Get Config.
     */
    private function getConfig()
    {
        $config = [
            'cant_login_config' => $this->configFetcher->getConfigById('cant_login')
        ];
        return Async::resolve($config);
    }
}
