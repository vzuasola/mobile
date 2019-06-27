<?php

namespace App\MobileEntry\Module\GameIntegration\GoldDeluxe;

use App\MobileEntry\Module\GameIntegration\ProviderTrait;

class GoldDeluxeModuleController
{
    use ProviderTrait;

    const KEY = 'gold_deluxe';

    private $rest;

    private $goldDeluxe;

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
    public function __construct($rest, $goldDeluxe, $config, $player)
    {
        $this->rest = $rest;
        $this->goldDeluxe = $goldDeluxe;
        $this->config = $config->withProduct('mobile-live-dealer');
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
            if ($requestData['gameCode'] || $requestData['gameCode'] !== 'undefined') {
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
            $responseData = $this->goldDeluxe->getLobby('icore_gd', [
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
            $responseData = $this->goldDeluxe->getGameUrlById('icore_gd', $requestData['gameCode'], [
                'options' => [
                    'languageCode' => $requestData['langCode'],
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
