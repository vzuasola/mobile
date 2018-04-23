<?php

namespace App\MobileEntry\Controller;

use App\BaseController;

class AboutController extends BaseController
{
    /**
     *
     */
    public function view($request, $response)
    {
        $data['title'] = 'About';

        return $this->widgets->render($response, '@site/page.html.twig', $data);
    }
}
