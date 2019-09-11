<?php

namespace App\MobileEntry\Component\Main\Lobby\ArcadeLobby;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;
use App\Async\Async;
use App\Async\DefinitionCollection;

class ArcadeLobbyComponentController
{
     /**
     * @var App\Fetcher\Drupal\ViewsFetcher
     */
    private $viewsFetcher;

    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $configs;

    /**
     * @var App\Player\PlayerSession
     */
    private $playerSession;

    private $product;

    private $rest;

    private $asset;

    private $url;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('product_resolver'),
            $container->get('config_fetcher'),
            $container->get('views_fetcher'),
            $container->get('player_session'),
            $container->get('rest'),
            $container->get('asset'),
            $container->get('uri')
        );
    }

    /**
     *
     */
    public function __construct(
        $product,
        $configs,
        $viewsFetcher,
        $playerSession,
        $rest,
        $asset,
        $url
    ) {
        $this->product = $product;
        $this->configs = $configs->withProduct($product->getProduct());
        $this->viewsFetcher = $viewsFetcher->withProduct($product->getProduct());
        $this->playerSession = $playerSession;
        $this->rest = $rest;
        $this->asset = $asset;
        $this->url = $url;
    }
}
