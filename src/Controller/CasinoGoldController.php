<?php

namespace App\MobileEntry\Controller;

use App\BaseController;

class CasinoGoldController extends BaseController
{
    /**
     *
     */
    public function view($request, $response)
    {
        if (!$this->get('player_session')->isLogin()) {
            return $response->withRedirect(
                $this->get('uri')->generateUri('/login?product=casino', [])
            );
        }

        if (!$this->get('accounts_service')->hasAccount('casino-gold')) {
            return $response->withRedirect(
                $this->get('uri')->generateUri('/casino', [])
            );
        }

        try {
            $config = $this->get('config_fetcher')
                ->withProduct($this->get('product_resolver')->getProduct())
                ->getConfig('webcomposer_config.header_configuration');
        } catch (\Exception $e) {
            $config = [];
        }

        $data['title'] = $config["lobby_page_title"] ?? 'Casino Gold';

        return $this->widgets->render($response, '@site/page.html.twig', $data);
    }

}
