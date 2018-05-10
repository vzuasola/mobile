<?php

namespace App\MobileEntry\Component\Main\Home\Products;

/**
 *
 */
class ProductsComponentController
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
                $productTiles = $this->viewFetcher->getViewById('product_lobby_tiles_entity');

                foreach ($productTiles as $productTile) {
                    if (isset($productTile['field_product_lobby_id'][0]['value']) &&
                        $productTile['field_product_lobby_id'][0]['value'] == $body['product']
                    ) {
                        $data['lobby_url'] = $productTile['field_product_lobby_url_post_log'][0]['uri'];
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
