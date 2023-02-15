<?php

namespace App\MobileEntry\Module\GameIntegration\Skywind;

use App\MobileEntry\Module\GameIntegration\ProviderTrait;
use App\Fetcher\Drupal\ViewsFetcher;

class SkywindModuleController
{
    use ProviderTrait;

    const KEY = 'skywind';

    private $rest;

    private $skywind;

    private $config;

    private $player;

    /**
     * @var ViewsFetcher $viewsFetcher
     */
    private $viewsFetcher;

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
            $container->get('views_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($rest, $skywind, $config, $player, $viewsFetcher)
    {
        $this->rest = $rest;
        $this->skywind = $skywind;
        $this->config = $config->withProduct('mobile-games');
        $this->player = $player;
        $this->viewsFetcher = $viewsFetcher->withProduct('mobile-games');
    }

    private function getGameLobby($request)
    {
        $data['currency'] = true;
        try {
            $responseData = $this->skywind->getLobby('icore_sw', [
                'options' => [
                    'languageCode' => $this->languageCode($request),
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

    private function getGameUrl($request)
    {
        $data['currency'] = true;
        $requestData = $request->getParsedBody();
        try {
            $responseData = $this->skywind->getGameUrlById('icore_sw', $requestData['gameCode'], [
                'options' => [
                    'languageCode' => $this->languageCode($request),
                    'playMode' => true
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
