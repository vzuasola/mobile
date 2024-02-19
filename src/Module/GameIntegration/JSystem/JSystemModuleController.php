<?php

namespace App\MobileEntry\Module\GameIntegration\JSystem;

use App\MobileEntry\Module\GameIntegration\ProviderTrait;
use App\Fetcher\Drupal\ViewsFetcher;

class JSystemModuleController
{
    use ProviderTrait;

    const KEY = 'jsystem';

    const ICORE_KEY = 'icore_jsystem';

    private $rest;

    private $jsystem;

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
    public function __construct($rest, $jsystem, $config, $player, $viewsFetcher, $playerGameFetcher)
    {
        $this->rest = $rest;
        $this->jsystem = $jsystem;
        $this->config = $config->withProduct('mobile-games');
        $this->player = $player;
        $this->viewsFetcher = $viewsFetcher->withProduct('mobile-games');
        $this->playerGameFetcher = $playerGameFetcher;
    }

    private function getGameLobby($request, $requestData)
    {
        $data['currency'] = true;
        list($gameCode, $product) = explode('|', $requestData['gameCode']);

        try {
            $responseData = $this->jsystem->getLobby(self::ICORE_KEY, [
                'options' => [
                    'languageCode' => $this->languageCode($request),
                    'providerProduct' => $product,
                    'gameCode' => $gameCode,
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

    private function getGameUrl($request, $requestData)
    {
        $data['currency'] = true;
        list($gameCode, $product) = explode('|', $requestData['gameCode']);

        try {
            $responseData = $this->jsystem->getGameUrlById(self::ICORE_KEY, $gameCode, [
                'options' => [
                    'languageCode' => $this->languageCode($request),
                    'providerProduct' => $product,
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
}
