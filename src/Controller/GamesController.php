<?php

namespace App\MobileEntry\Controller;

use App\BaseController;

class GamesController extends BaseController
{
    /**
     *
     */
    public function view($request, $response)
    {
        $data['title'] = 'Games';

        return $this->widgets->render($response, '@site/page.html.twig', $data);
    }
}
