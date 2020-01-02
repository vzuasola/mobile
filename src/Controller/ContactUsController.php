<?php

namespace App\MobileEntry\Controller;

use App\BaseController;
use Slim\Exception\NotFoundException;

class ContactUsController extends BaseController
{
    /**
     *
     */
    public function view($request, $response)
    {
        $data['title'] = 'Contact Us';

        return $this->widgets->render($response, '@site/page.html.twig', $data);
    }
}
