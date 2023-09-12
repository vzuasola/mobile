<?php

namespace App\MobileEntry\Module\GameIntegration\OneGame;

use App\MobileEntry\Module\GameIntegration\ProviderTrait;
use App\Fetcher\Drupal\ViewsFetcher;

class OneGameModuleController
{
    use ProviderTrait;

    const KEY = 'onegame';

    private $rest;

    private $oneGame;

    private $config;

    private $player;

    /**
     * @var ViewsFetcher $viewsFetcher
     */
    private $viewsFetcher;

    private $playerGameFetcher;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('rest'),
            $container->get('game_provider_fetcher'),
            $container->get('config_fetcher'),
            $container->get('player'),
            $container->get('views_fetcher'),
            $container->get('player_game_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($rest, $oneGame, $config, $player, $viewsFetcher, $playerGameFetcher)
    {
        $this->rest = $rest;
        $this->oneGame = $oneGame;
        $this->config = $config->withProduct('mobile-games');
        $this->player = $player;
        $this->viewsFetcher = $viewsFetcher->withProduct('mobile-games');
        $this->playerGameFetcher = $playerGameFetcher;
    }

    /**
     * Get GameURL via GetGeneralLobby
    */
    private function getGameUrl($request, $requestData)
    {
        $data['currency'] = true;
        $data['gameurl'] = false;
        $params = explode('|', $requestData['gameCode']);
        $providerProduct = $params[1] ?? 'games';
        try {
            $responseData = $this->oneGame->getGameUrlById('icore_onegame', $params[0], [
                'options' => [
                    'languageCode' => $this->languageCode($request),
                    'providerProduct' => $providerProduct
                ]
            ]);
            if ($responseData['url']) {
                $data['gameurl'] = $responseData['url'];
            }
        } catch (\Exception $e) {
            // do nothing
        }

        return $data;
    }
}
