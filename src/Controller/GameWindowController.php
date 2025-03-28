<?php

namespace App\MobileEntry\Controller;

use App\BaseController;

class GameWindowController extends BaseController
{
    /**
     *
     */
    public function view($request, $response)
    {
        try {
            $config = $this->get('config_fetcher')
                ->withProduct($this->get('product_resolver')->getProduct())
                ->getConfig('webcomposer_config.header_configuration');
        } catch (\Exception $e) {
            $config = [];
        }

        $data['title'] = $config["lobby_page_title"] ?? 'Lottoland';

        return $this->widgets->render($response, '@site/gamewindow.html.twig', $data);
    }
}
