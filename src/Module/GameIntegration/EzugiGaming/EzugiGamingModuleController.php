<?php

namespace App\MobileEntry\Module\GameIntegration\EzugiGaming;

use App\MobileEntry\Module\GameIntegration\ProviderTrait;

class EzugiGamingModuleController
{
    use ProviderTrait;

    const KEY = 'ezugi_gaming';

    private $rest;

    private $ezugi;

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
    public function __construct($rest, $ezugi, $config, $player)
    {
        $this->rest = $rest;
        $this->ezugi = $ezugi;
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
            $data = $this->getGameLobby($request, $response);
        }

        return $this->rest->output($response, $data);
    }

    private function getGameLobby($request, $response)
    {
        $data['currency'] = true;
        $requestData = $request->getParsedBody();

        try {
            $responseData = $this->ezugi->getLobby('icore_ezugi', [
                'options' => [
                    'languageCode' => $requestData['langCode'],
                    'gameName' => $requestData['gameCode']
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
}
