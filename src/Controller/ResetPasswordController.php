<?php

namespace App\MobileEntry\Controller;

use App\BaseController;

class ResetPasswordController extends BaseController
{
    /**
     *
     */
    public function view($request, $response)
    {
        $data['title'] = 'Reset Password';

        return $this->widgets->render($response, '@site/page.html.twig', $data);
    }
}
