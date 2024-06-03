<?php

namespace App\MobileEntry\Module\GameIntegration\EzugiGaming;

use Slim\Http\Request;
use App\Rest\Resource;
use App\Fetcher\Drupal\ConfigFetcher;
use App\Fetcher\Integration\GameProviderFetcher;
use App\Fetcher\Integration\PlayerGameFetcher;
use App\Player\Player;
use App\MobileEntry\Module\GameIntegration\ProviderTrait;
use App\Fetcher\Drupal\ViewsFetcher;

class EzugiGamingModuleController
{
    use ProviderTrait;

    const KEY = 'ezugi_gaming';

    /**
     * @var Resource $rest
     */
    private $rest;

    /**
     * @var GameProviderFetcher $ezugi
     */
    private $ezugi;

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
     * @param \App\Fetcher\Integration\GameProviderFetcher $ezugi GameProvider Fetcher object
     * @param \App\Fetcher\Drupal\ConfigFetcher $config Config Fetcher Object
     * @param \App\Player\Player $player Player Object
     * @param \App\Fetcher\Drupal\ViewsFetcher $viewsFetcher Views Fetcher Object
     * @param \App\Fetcher\Integration\PlayerGameFetcher $playerGameFetcher Player Game Fetcher object;
     */
    public function __construct(
        Resource $rest,
        GameProviderFetcher $ezugi,
        ConfigFetcher $config,
        Player $player,
        ViewsFetcher $viewsFetcher,
        PlayerGameFetcher $playerGameFetcher
    ) {
        $this->rest = $rest;
        $this->ezugi = $ezugi;
        $this->config = $config->withProduct('mobile-live-dealer');
        $this->player = $player;
        $this->viewsFetcher = $viewsFetcher->withProduct('mobile-live-dealer');
        $this->playerGameFetcher = $playerGameFetcher;
    }

    private function getGameLobby($request, $response)
    {
        $data['currency'] = true;
        $requestData = $request->getParsedBody();

        try {
            $responseData = $this->ezugi->getLobby('icore_ezugi', [
                'options' => [
                    'languageCode' =>  $this->languageCode($request),
                    'gameName' => $requestData['gameCode'],
                    'tableName' => $requestData['tableName']
                ]
            ]);
            if ($responseData) {
                $data['gameurl'] = $responseData;
            }
        } catch (\Exception $e) {
            $data['currency'] = true;
        }

        return $data;
    }

    /**
     * Set Properties parameter for PlayerGame API
     * @param array $requestData processed POST array data
     * @return array params
     */
    public function getPlayerGameExtraParams(array $requestData)
    {
        $params[] = [
            'Key' => 'openTable',
            'Value' => $requestData['tableName'] ?? ''
        ];

        return $params;
    }
}
