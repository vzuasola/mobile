<?php

namespace App\MobileEntry\Controller;

use App\BaseController;

class PromotionsController extends BaseController
{
    /**
     *
     */
    public function view($request, $response)
    {
        $data['title'] = 'Promotions';

        return $this->widgets->render($response, '@site/page.html.twig', $data);
    }
}
