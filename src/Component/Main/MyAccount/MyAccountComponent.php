<?php

namespace App\MobileEntry\Component\Main\MyAccount;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;
use App\MobileEntry\Form\ForgotPasswordForm;
use App\MobileEntry\Form\ForgotUsernameForm;
use App\MobileEntry\Form\ResetPasswordForm;

class MyAccountComponent implements ComponentWidgetInterface
{
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
        return [];
    }
}
