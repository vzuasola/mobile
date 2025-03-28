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
        try {
            $config = $this->get('config_fetcher')
                ->getConfig('webcomposer_config.header_configuration');
        } catch (\Exception $e) {
            $config = [];
        }

        $data['title'] = $config["lobby_page_title"] ?? $this->get('translation_manager')->getTranslation('home');
        $data['is_front'] = true;

        return $this->widgets->render($response, '@site/homepage.html.twig', $data);
    }
}
