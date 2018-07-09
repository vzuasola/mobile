<?php

namespace App\MobileEntry\Controller;

use App\BaseController;

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
