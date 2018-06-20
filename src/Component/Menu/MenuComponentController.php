<?php

namespace App\MobileEntry\Component\Menu;

/**
 *
 */
class MenuComponentController
{
    private $playerSession;
    private $viewFetcher;
    private $rest;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session'),
            $container->get('views_fetcher'),
            $container->get('rest')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($playerSession, $viewFetcher, $rest)
    {
        $this->playerSession = $playerSession;
        $this->viewFetcher = $viewFetcher;
        $this->rest = $rest;
    }

    public function lobby($request, $response)
    {
        $data = [];
        $body = $request->getParsedBody();
        try {
            $data['lobby_url'] = '';
            if (!empty($body['product'])) {
                $productMenus = $this->viewFetcher->getViewById('mobile_product_menu');

                foreach ($productMenus as $productMenu) {
                    if (isset($productMenu['field_product_menu_id'][0]['value'])
                        && ($productMenu['field_product_menu_id'][0]['value'] == $body['product'])) {
                        $data['lobby_url'] = $productMenu['field_product_menu_url_post_log'][0]['uri'];
                        break;
                    }
                }
            }
        } catch (\Exception $e) {
            $data['lobby_url'] = '';
        }

        return $this->rest->output($response, $data);
    }
}
