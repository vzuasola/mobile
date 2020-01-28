<?php

namespace App\MobileEntry\Module\GameIntegration\WAC;

use App\MobileEntry\Module\GameIntegration\ProviderTrait;

class WACModuleController
{
    use ProviderTrait;

    const KEY = 'wac';

    private $rest;

    private $wac;

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
    public function __construct($rest, $wac, $config, $player)
    {
        $this->rest = $rest;
        $this->wac = $wac;
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
                $requestData['lobby'] === "false") {
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
            $responseData = $this->wac->getLobby('icore_wac', [
                'options' => [
                    'languageCode' => $requestData['langCode'],
                    'gameCode' => $requestData['gameCode'],
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
            $params = explode('|', $requestData['gameCode']);
            $responseData = $this->wac->getGameUrlById('icore_wac', $params[0], [
                'options' => [
                    'languageCode' => $requestData['langCode'],
                    'providerProduct' => $params[1] ?? null,
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
