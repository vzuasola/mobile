<?php

namespace App\MobileEntry\Component\Main\ResetPassword;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;
use App\MobileEntry\Form\ForgotPasswordForm;
use App\MobileEntry\Form\ForgotUsernameForm;

class ResetPasswordComponent implements ComponentWidgetInterface
{

    private $formManager;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('form_manager')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($formManager)
    {
        $this->formManager = $formManager;
    }

    /**
     * {@inheritdoc}
     */
    public function getTemplate()
    {
        return '@component/Main/ResetPassword/template.html.twig';
    }

    /**
     * {@inheritdoc}
     */
    public function getData()
    {
        $data = [];
        $data['formForgotPassword'] = $this->formManager->getForm(ForgotPasswordForm::class)->createView();
        $data['formForgotUsername'] = $this->formManager->getForm(ForgotUsernameForm::class)->createView();

        $data['name'] = 'Drew';
        $data['title'] = 'Can\'t access your Dafabet Account?';

        return $data;
    }
}
