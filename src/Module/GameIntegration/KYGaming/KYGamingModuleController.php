<?php

namespace App\MobileEntry\Module\GameIntegration\KYGaming;

use App\MobileEntry\Module\GameIntegration\ProviderTrait;

class KYGamingModuleController
{
    use ProviderTrait;

    const KEY = 'ky_gaming';

    private $rest;

    private $kyGaming;

    private $config;

    private $player;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('rest'),
            $container->get('game_provider_fetcher'),
            $container->get('config_fetcher'),
            $container->get('player')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($rest, $kyGaming, $config, $player)
    {
        $this->rest = $rest;
        $this->kyGaming = $kyGaming;
        $this->config = $config->withProduct('mobile-games');
        $this->player = $player;
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
        $requestData = $request->getParsedBody();

        try {
            $responseData = $this->kyGaming->getLobby('icore_ky', [
                'options' => [
                    'languageCode' => $requestData['langCode'],
                ]
            ]);
            if ($responseData) {
                $data['gameurl'] = $responseData;
            }
        } catch (\Exception $e) {
            $data = [];
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

            $responseData = $this->kyGaming->getGameUrlById('icore_ky', $gameCode, [
                'options' => [
                    'languageCode' => $requestData['langCode'],
                    'playMode' => 'true',
                    'providerProduct' => $productProvider,
                ]
            ]);
            if ($responseData['url']) {
                $data['gameurl'] = $responseData['url'];
            }
        } catch (\Exception $e) {
            $data = [];
        }
        return $data;
    }
}
