<?php

namespace App\MobileEntry\Controller;

use App\BaseController;

class MyAccountController extends BaseController
{
    /**
     *
     */
    public function view($request, $response)
    {
        $data['title'] = 'My Account';

        return $this->widgets->render($response, '@site/page.html.twig', $data);
    }
}
