<?php

namespace App\MobileEntry\Module\GameIntegration\MicroGaming;

use App\MobileEntry\Module\GameIntegration\ProviderTrait;
use App\Fetcher\Drupal\ViewsFetcher;

class MicroGamingModuleController
{
    use ProviderTrait;

    const KEY = 'micro_gaming';

    private $rest;

    private $microGaming;

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
    public function __construct($rest, $microGaming, $config, $player, $viewsFetcher)
    {
        $this->rest = $rest;
        $this->microGaming = $microGaming;
        $this->config = $config->withProduct('mobile-games');
        $this->player = $player;
        $this->viewsFetcher = $viewsFetcher->withProduct('mobile-games');
    }

    /**
     * @{inheritdoc}
     */
    public function launch($request, $response)
    {
        $data['gameurl'] = false;
        $data['currency'] = false;
        if ($this->checkCurrency($request)) {
            $requestData = $request->getParsedBody();
            if ($requestData['gameCode'] && $requestData['gameCode'] !== 'undefined') {
                $data = $this->getGameUrl($request, $response);
            }

            if (!$requestData['gameCode'] || $requestData['gameCode'] === 'undefined') {
                $data = $this->getGameLobby($request, $response);
            }
        }

        return $this->rest->output($response, $data);
    }

    private function getGameLobby($request, $response)
    {
        $data['currency'] = true;

        try {
            $responseData = $this->microGaming->getLobby('icore_mg', [
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

    private function getGameUrl($request, $response)
    {
        $data['currency'] = true;
        $requestData = $request->getParsedBody();

        try {
            $params = explode('|', $requestData['gameCode']);
            $gameCode = $params[0];
            $productProvider = $params[1] ?? null;

            $responseData = $this->microGaming->getGameUrlById('icore_mg', $gameCode, [
                'options' => [
                    'languageCode' => $this->languageCode($request),
                    'playMode' => 'true',
                    'providerProduct' => $productProvider,
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
