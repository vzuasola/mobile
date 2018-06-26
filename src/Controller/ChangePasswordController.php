<?php

namespace App\MobileEntry\Controller;

use App\BaseController;

class ChangePasswordController extends BaseController
{
    /**
     *
     */
    public function view($request, $response)
    {
        $data['title'] = 'Change Password';

        return $this->widgets->render($response, '@site/page.html.twig', $data);
    }
}
