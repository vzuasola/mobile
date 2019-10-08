<?php

namespace App\MobileEntry\Module\GameIntegration\Skywind;

use App\MobileEntry\Module\GameIntegration\ProviderTrait;

class SkywindModuleController
{
    use ProviderTrait;

    const KEY = 'skywind';

    private $rest;

    private $skywind;

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
    public function __construct($rest, $skywind, $config, $player)
    {
        $this->rest = $rest;
        $this->skywind = $skywind;
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
            if (($requestData['gameCode'] && $requestData['gameCode'] !== 'undefined') &&
                $requestData['lobby'] === "false"
            ) {
                $data = $this->getGameUrl($request);
            }

            if ((!$requestData['gameCode'] || $requestData['gameCode'] === 'undefined') ||
                $requestData['lobby'] === "true"
            ) {
                $data = $this->getGameLobby($request);
            }
        }

        return $this->rest->output($response, $data);
    }

    private function getGameLobby($request)
    {
        $data['currency'] = true;
        $requestData = $request->getParsedBody();

        try {
            $responseData = $this->skywind->getLobby('icore_sw', [
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

    private function getGameUrl($request)
    {
        $data['currency'] = true;
        $requestData = $request->getParsedBody();
        try {
            $responseData = $this->skywind->getGameUrlById('icore_sw', $requestData['gameCode'], [
                'options' => [
                    'languageCode' => $requestData['langCode'],
                    'playMode' => true
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
