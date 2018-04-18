<?php

namespace App\MobileEntry\Controller;

use App\BaseController;
use Slim\Exception\NotFoundException;

class AboutController extends BaseController
{
    /**
     *
     */
    public function about($request, $response)
    {
        $data['title'] = 'About';

        return $this->view->render($response, '@site/page.html.twig', $data);
    }

    /**
     *
     */
    public function summary($request, $response)
    {
        $data['title'] = 'Summary';

        return $this->view->render($response, '@site/page.html.twig', $data);
    }
}
