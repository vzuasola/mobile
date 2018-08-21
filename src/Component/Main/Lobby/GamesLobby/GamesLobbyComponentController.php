<?php

namespace App\MobileEntry\Component\Main\Lobby\GamesLobby;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class GamesLobbyComponentController
{
    /**
     * @var App\Player\PlayerSession
     */
    private $playerSession;

    /**
     * @var App\Fetcher\Integration\PreferencesFetcher
     */
    private $views;

    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $configs;

    private $rest;

    private $asset;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session'),
            $container->get('views_fetcher'),
            $container->get('rest'),
            $container->get('config_fetcher'),
            $container->get('asset')
        );
    }

    /**
     * Public constructor
     */
    public function __construct(
        $playerSession,
        $views,
        $rest,
        $configs,
        $asset
    ) {
        $this->playerSession = $playerSession;
        $this->views = $views->withProduct('mobile-games');
        $this->rest = $rest;
        $this->configs = $configs;
        $this->asset = $asset;
    }

    public function lobby($request, $response)
    {
        $data = [];
        try {
            $data['categories'] = $this->views->getViewById('games_category');
        } catch (\Exception $e) {
            $data['categories'] = [];
        }

        try {
            $data['games'] = $this->views->getViewById('games_list');
        } catch (\Exception $e) {
            $data['games'] = [];
        }

        return $this->rest->output($response, $data);
    }
}
