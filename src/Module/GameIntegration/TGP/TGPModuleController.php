<?php

namespace App\MobileEntry\Module\GameIntegration\TGP;

use App\MobileEntry\Module\GameIntegration\ProviderTrait;

class TGPModuleController
{
    use ProviderTrait;

    const KEY = 'tgp';

    private $rest;

    private $tgp;

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
    public function __construct($rest, $tgp, $config, $player)
    {
        $this->rest = $rest;
        $this->tgp = $tgp;
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
            $responseData = $this->tgp->getLobby('icore_tgp', [
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
}
