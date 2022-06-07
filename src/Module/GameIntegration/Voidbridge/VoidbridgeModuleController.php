<?php

namespace App\MobileEntry\Module\GameIntegration\Voidbridge;

use App\MobileEntry\Module\GameIntegration\ProviderTrait;
use App\Fetcher\Drupal\ViewsFetcher;

class VoidbridgeModuleController
{
    use ProviderTrait;

    const KEY = 'voidbridge';

    private $rest;

    private $voidbridge;

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
    public function __construct($rest, $voidbridge, $config, $player, $viewsFetcher)
    {
        $this->rest = $rest;
        $this->voidbridge = $voidbridge;
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

            if (($requestData['gameCode'] && $requestData['gameCode'] !== 'undefined') &&
              $requestData['lobby'] === "false"
            ) {
                $data = $this->getGameUrl($request, $requestData);
            }
            if ((!$requestData['gameCode'] || $requestData['gameCode'] === 'undefined') ||
              $requestData['lobby'] === "true"
            ) {
                $data = $this->getGameLobby($request, $requestData);
            }
        }

        return $this->rest->output($response, $data);
    }

    private function getGameUrl($request, $requestData)
    {
        $data['currency'] = true;
        $params = explode('|', $requestData['gameCode']);
        try {
            $responseData = $this->voidbridge->getGameUrlById('icore_vb', $params[0], [
              'options' => [
                'languageCode' => $this->languageCode($request),
                'userAgent' => $requestData['userAgent'],
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

    private function getGameLobby($request, $requestData)
    {
        $data['currency'] = true;
        $params = explode('|', $requestData['gameCode']);
        $options = [
          'options' => [
            'lobbyCode' => $params[0] ?? $requestData['gameCode'],
            'providerProduct' => $params[1] ?? null,
            'languageCode' => $this->languageCode($request),
            'userAgent' => $requestData['userAgent'],
            'tableName' => $requestData['tableName'] ?? null,
          ]
        ];

        try {
            $responseData = $this->voidbridge->getLobby('icore_vb', $options);

            if ($responseData) {
                $data['gameurl'] = $responseData;
            }
        } catch (\Exception $e) {
            $data['currency'] = true;
        }

        return $data;
    }
}
