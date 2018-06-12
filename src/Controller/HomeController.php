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
        $data['title'] = $this->get('translation_manager')->getTranslation('home');
        $data['is_front'] = true;

        return $this->widgets->render($response, '@site/page.html.twig', $data);
    }
}
