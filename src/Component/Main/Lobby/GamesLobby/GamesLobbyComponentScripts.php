<?php

namespace App\MobileEntry\Component\Main\Lobby\GamesLobby;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;

/**
 *
 */
class GamesLobbyComponentScripts implements ComponentAttachmentInterface
{
    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $configs;

    private $playerSession;

    private $product;
    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session'),
            $container->get('config_fetcher'),
            $container->get('product_resolver')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($playerSession, $configs, $product)
    {
        $this->playerSession = $playerSession;
        $this->product = $product;
        $this->configs = $configs->withProduct($product->getProduct());
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        try {
            $config = $this->configs->getConfig('games_search.search_configuration');
        } catch (\Exception $e) {
            $config = [];
        }

        return [
            'authenticated' => $this->playerSession->isLogin(),
            'search_config' => $config
        ];
    }
}
