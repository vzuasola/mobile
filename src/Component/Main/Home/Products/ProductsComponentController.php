<?php

namespace App\MobileEntry\Component\Main\Home\Products;

/**
 *
 */
class ProductsComponentController
{
    private $playerSession;
    private $viewFetcher;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session'),
            $container->get('views_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($playerSession, $viewFetcher)
    {
        $this->playerSession = $playerSession;
        $this->viewFetcher = $viewFetcher;
    }

    public function lobby($request)
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

        return $data;
    }
}
