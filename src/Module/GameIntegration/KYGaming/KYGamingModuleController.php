<?php

namespace App\MobileEntry\Module\GameIntegration\KYGaming;

use Slim\Http\Request;
use App\Rest\Resource;
use App\Fetcher\Drupal\ConfigFetcher;
use App\Fetcher\Integration\GameProviderFetcher;
use App\Fetcher\Integration\PlayerGameFetcher;
use App\Player\Player;
use App\MobileEntry\Module\GameIntegration\ProviderTrait;
use App\Fetcher\Drupal\ViewsFetcher;

class KYGamingModuleController
{
    use ProviderTrait;

    const KEY = 'ky_gaming';

    /**
     * @var Resource $rest
     */
    private $rest;

    /**
     * @var GameProviderFetcher $kyGaming
     */
    private $kyGaming;

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
     * @param \App\Fetcher\Integration\GameProviderFetcher $kyGaming GameProvider Fetcher object
     * @param \App\Fetcher\Drupal\ConfigFetcher $config Config Fetcher Object
     * @param \App\Player\Player $player Player Object
     * @param \App\Fetcher\Drupal\ViewsFetcher $viewsFetcher Views Fetcher Object
     * @param \App\Fetcher\Integration\PlayerGameFetcher $playerGameFetcher Player Game Fetcher object;
     */
    public function __construct(
        Resource $rest,
        GameProviderFetcher $kyGaming,
        ConfigFetcher $config,
        Player $player,
        ViewsFetcher $viewsFetcher,
        PlayerGameFetcher $playerGameFetcher
    ) {
        $this->rest = $rest;
        $this->kyGaming = $kyGaming;
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
            $responseData = $this->kyGaming->getGameUrlById('icore_ky', $requestData['gameCode'], [
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
            'Key' => 'KYGameCode',
            'Value' => $requestData['gameCode'] ?? ''
        ];

        return $params;
    }
}
