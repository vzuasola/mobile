<?php

namespace App\MobileEntry\Controller;

use App\BaseController;
use Slim\Exception\NotFoundException;

class PageController extends BaseController
{
    /**
     *
     */
    public function home($request, $response)
    {
        $data['title'] = 'Home';

        return $this->view->render($response, '@site/page.html.twig', $data);
    }
}
