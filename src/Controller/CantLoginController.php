<?php

namespace App\MobileEntry\Controller;

use App\BaseController;
use App\MobileEntry\Form\ForgotPasswordForm;
use App\MobileEntry\Form\ForgotUsernameForm;
use App\MobileEntry\Form\ResetPasswordForm;

class CantLoginController extends BaseController
{
    /**
     *
     */
    public function view($request, $response)
    {
        $data['title'] = 'Cant Login';

        return $this->widgets->render($response, '@site/page.html.twig', $data);
    }
}
