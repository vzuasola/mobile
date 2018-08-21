<?php

namespace App\MobileEntry\Component\Main\MyAccount\Profile\VerifyPassword;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;
use App\MobileEntry\Form\VerifyPasswordForm;

class VerifyPasswordComponent implements ComponentWidgetInterface
{
    /**
     * Form manager object.
     */
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
        return '@component/Main/MyAccount/Profile/VerifyPassword/template.html.twig';
    }

    /**
     * {@inheritdoc}
     */
    public function getData()
    {
        $verifyPasswordForm = $this->formManager->getForm(VerifyPasswordForm::class);

        return [
            'verifyPasswordForm' => $verifyPasswordForm->createView(),
        ];
    }
}
