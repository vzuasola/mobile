<?php

namespace App\MobileEntry\Module\GameIntegration\FunGaming;

use Slim\Http\Request;
use App\Rest\Resource;
use App\Fetcher\Drupal\ConfigFetcher;
use App\Fetcher\Integration\GameProviderFetcher;
use App\Fetcher\Integration\PlayerGameFetcher;
use App\Player\Player;
use App\MobileEntry\Module\GameIntegration\ProviderTrait;
use App\Fetcher\Drupal\ViewsFetcher;

class FunGamingModuleController
{
    use ProviderTrait;

    const KEY = 'fun_gaming';

    /**
     * @var Resource $rest
     */
    private $rest;

    /**
     * @var GameProviderFetcher $funGaming
     */
    private $funGaming;

    /**
     * @var ConfigFetcher $config
     */
    private $config;

    /**
     * @var Player $player
     */
    private $player;

    /**
     * @var ViewsFetcher $viewsFetcher
     */
    private $viewsFetcher;

    /**
     * @var PlayerGameFetcher $playerGameFetcher
     */
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
     * @param \App\Rest\Resource $rest Rest Object.
     * @param \App\Fetcher\Integration\GameProviderFetcher $funGaming GameProvider Fetcher object
     * @param \App\Fetcher\Drupal\ConfigFetcher $config Config Fetcher Object
     * @param \App\Player\Player $player Player Object
     * @param \App\Fetcher\Drupal\ViewsFetcher $viewsFetcher Views Fetcher Object
     * @param \App\Fetcher\Integration\PlayerGameFetcher $playerGameFetcher Player Game Fetcher object;
     */
    public function __construct(
        Resource $rest,
        GameProviderFetcher $funGaming,
        ConfigFetcher $config,
        Player $player,
        ViewsFetcher $viewsFetcher,
        PlayerGameFetcher $playerGameFetcher
    ) {
        $this->rest = $rest;
        $this->funGaming = $funGaming;
        $this->config = $config->withProduct('mobile-arcade');
        $this->player = $player;
        $this->viewsFetcher = $viewsFetcher->withProduct('mobile-arcade');
        $this->playerGameFetcher = $playerGameFetcher;
    }

    /**
     * Fetch game URL using GetGeneralLobby API
     * @param \Slim\Http\Request $request the request object
     * @param array $requestData processed POST array data
     * @return array gameurl and currency
     */
    private function getGameUrl(Request $request, array $requestData)
    {
        $data['currency'] = true;

        try {
            $responseData = $this->funGaming->getGameUrlById('icore_fg', $requestData['gameCode'], [
                'options' => [
                    'languageCode' => $this->languageCode($request),
                ]
            ]);
            if ($responseData['url']) {
                $data['gameurl'] = $responseData['url'];
            }
        } catch (\Exception $e) {
            $data['currency'] = true;
        }

        return $data;
    }

    /**
     * Set Properties parameter for PlayerGame API
     * @param \Slim\Http\Request $request the request object
     * @param array $requestData processed POST array data
     * @return array params
     */
    public function getPlayerGameExtraParams(array $requestData)
    {
        $params[] = [
            'Key' => 'FGGameCode',
            'Value' => $requestData['gameCode'] ?? ''
        ];

        return $params;
    }
}
