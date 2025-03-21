<?php

namespace App\MobileEntry\Module\GameIntegration\CQ9;

use App\MobileEntry\Module\GameIntegration\ProviderTrait;
use App\Fetcher\Drupal\ViewsFetcher;

class CQ9ModuleController
{
    use ProviderTrait;

    const KEY = 'cq9';

    private $rest;

    private $cq9;

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
    public function __construct($rest, $cq9, $config, $player, $viewsFetcher, $playerGameFetcher)
    {
        $this->rest = $rest;
        $this->cq9 = $cq9;
        $this->config = $config->withProduct('mobile-games');
        $this->player = $player;
        $this->viewsFetcher = $viewsFetcher->withProduct('mobile-games');
        $this->playerGameFetcher = $playerGameFetcher;
    }

    /**
     * Get GameURL via GetGeneralLobby
     */
    public function getGameUrl($request, $requestData)
    {
        $data = [
            'gameurl' => false,
            'currency' => true,
        ];

        $params = explode('|', $requestData['gameCode']);

        try {
            $responseData = $this->cq9->getGameUrlById('icore_cq9', $params[0], [
                'options' => [
                    'languageCode' => $this->languageCode($request),
                    'providerProduct' => $params[1] ?? null,
                ]
            ]);
            if ($responseData['url']) {
                $data['gameurl'] = $responseData['url'];
            }
        } catch (\Exception $e) {
            // Do nothing
        }

        return $data;
    }
}
