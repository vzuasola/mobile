<?php

namespace App\MobileEntry\Controller;

use App\BaseController;

class HomeController extends BaseController
{
    /**
     *
     */
    public function view($request, $response)
    {
        $data['title'] = 'Home';

        return $this->widgets->render($response, '@site/page.html.twig', $data);
    }
}
