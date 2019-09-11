<?php

namespace App\MobileEntry\Module\GameIntegration\EvolutionGaming;

use App\MobileEntry\Module\GameIntegration\ProviderTrait;

class EvolutionGamingModuleController
{
    use ProviderTrait;

    const KEY = 'evo_gaming';

    private $rest;

    private $evoGaming;

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
    public function __construct($rest, $evoGaming, $config, $player)
    {
        $this->rest = $rest;
        $this->evoGaming = $evoGaming;
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
            if (($requestData['gameCode'] && $requestData['gameCode'] !== 'undefined') &&
                $requestData['lobby'] === "false"
            ) {
                $data = $this->getGameUrl($request, $response);
            }

            if ($requestData['lobby'] === "true") {
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
            $options = [
                'languageCode' => $requestData['langCode']
            ];

            if (isset($requestData['gameCode']) && $requestData['gameCode'] !== 'undefined') {
                $options['category'] = $requestData['gameCode'];
            }

            $responseData = $this->evoGaming->getLobby('icore_evo', [
                'options' => $options
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
            $responseData = $this->evoGaming->getGameUrlById('icore_evo', $requestData['gameCode'], [
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
