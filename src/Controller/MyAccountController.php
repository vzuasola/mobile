<?php

namespace App\MobileEntry\Controller;

use App\BaseController;
use Slim\Exception\NotFoundException;

class MyAccountController extends BaseController
{
    /**
     *
     */
    public function view($request, $response)
    {
        $data['title'] = 'My Account';
        $state = $this->get('player_session')->isLogin();

        if ($state) {
            return $this->widgets->render($response, '@site/page.html.twig', $data);
        } else {
            throw new NotFoundException($request, $response);
        }
    }
}
