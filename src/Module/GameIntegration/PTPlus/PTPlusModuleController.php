<?php

namespace App\MobileEntry\Module\GameIntegration\PTPlus;

use Slim\Http\Request;
use App\Rest\Resource;
use App\Fetcher\Drupal\ConfigFetcher;
use App\Fetcher\Integration\GameProviderFetcher;
use App\Fetcher\Integration\PlayerGameFetcher;
use App\Player\Player;
use App\MobileEntry\Module\GameIntegration\ProviderTrait;
use App\Fetcher\Drupal\ViewsFetcher;

class PTPlusModuleController
{
    use ProviderTrait;

    const KEY = 'ptplus';

    /**
     * @var Resource $rest
     */
    private $rest;

     /**
     * @var GameProviderFetcher $ptplus
     */
    private $ptplus;

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
     * @param \App\Fetcher\Integration\GameProviderFetcher $ptplus GameProvider Fetcher object
     * @param \App\Fetcher\Drupal\ConfigFetcher $config Config Fetcher Object
     * @param \App\Player\Player $player Player Object
     * @param \App\Fetcher\Drupal\ViewsFetcher $viewsFetcher Views Fetcher Object
     * @param \App\Fetcher\Integration\PlayerGameFetcher $playerGameFetcher Player Game Fetcher object;
     */
    public function __construct(
        Resource $rest,
        GameProviderFetcher $ptplus,
        ConfigFetcher $config,
        Player $player,
        ViewsFetcher $viewsFetcher,
        PlayerGameFetcher $playerGameFetcher
    ) {
        $this->rest = $rest;
        $this->ptplus = $ptplus;
        $this->config = $config->withProduct('mobile-soda-casino');
        $this->player = $player;
        $this->viewsFetcher = $viewsFetcher->withProduct('mobile-soda-casino');
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
        $data = [ "gameurl" => false, "currency" => true ];
        $params = explode('|', $requestData['gameCode']);
        $providerProduct = $requestData['product'] ?? 'mobile-soda-casino';
        try {
            $responseData = $this->ptplus->getGameUrlById('icore_ptplus', $params[0], [
                'options' => [
                    'languageCode' => $this->languageCode($request),
                    'providerProduct' => $providerProduct,
                    'gameType' => $params[1] ?? null
                ]
            ]);

            if ($responseData['url']) {
                $data['gameurl'] = $responseData['url'];
            }
        } catch (\Exception $e) {
        }

        return $data;
    }

    /**
     * Set Properties parameter for PlayerGame API
     * @param array $requestData processed POST array data
     * @return array params
     */
    protected function getPlayerGameExtraParams(array $requestData)
    {
        $codeParams = explode('|', $requestData['gameCode']);
        $params = [
            [
                'Key' => 'GameCode',
                'Value' => $codeParams[0] ?? ''
            ],
            [
                'Key' => 'GameType',
                'Value' => $codeParams[1] ?? ''
            ],
            [
                'Key' => 'GameMode',
                'Value' => '1',
            ]
        ];

        return $params;
    }
}
