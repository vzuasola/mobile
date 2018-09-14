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
        var_dump($state);

        if ($state) {
            print_r("Success");
            die();
            return $this->widgets->render($response, '@site/page.html.twig', $data);
        } else {
            print_r("Failed");
            die();
            throw new NotFoundException($request, $response);
        }
    }
}
