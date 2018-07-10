<?php

namespace App\MobileEntry\Controller;

use App\BaseController;

class SessionController extends BaseController
{
    /**
     *
     */
    public function view($request, $response)
    {
        $data['title'] = 'Session';

        return $this->widgets->render($response, '@site/page.html.twig', $data);
    }
}
