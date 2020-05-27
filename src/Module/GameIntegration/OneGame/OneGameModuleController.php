<?php

namespace App\MobileEntry\Module\GameIntegration\OneGame;

use App\MobileEntry\Module\GameIntegration\ProviderTrait;
use App\Fetcher\Drupal\ViewsFetcher;

class OneGameModuleController
{
    use ProviderTrait;

    const KEY = 'onegame';

    private $rest;

    private $oneGame;

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
    public function __construct($rest, $oneGame, $config, $player, $viewsFetcher)
    {
        $this->rest = $rest;
        $this->oneGame = $oneGame;
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
                $data = $this->getGameUrl($requestData);
            }
            if ((!$requestData['gameCode'] || $requestData['gameCode'] === 'undefined') ||
                $requestData['lobby'] === "true"
            ) {
                $data = $this->getGameLobby($requestData);
            }
        }

        return $this->rest->output($response, $data);
    }

    /**
     * Get Lobby URL
     */
    private function getGameLobby($requestData)
    {
        $data['currency'] = true;
        $params = explode('|', $requestData['gameCode']);

        if (!empty($params)) {
            $options['gameCode'] = $params;
        }

        $options = [
            'options' => [
                'languageCode' => $requestData['langCode'],
            ]
        ];

        try {
            $responseData = $this->oneGame->getLobby('icore_onegame', $options);

            if ($responseData) {
                $data['gameurl'] = $responseData;
            }
        } catch (\Exception $e) {
            $data['currency'] = true;
        }

        return $data;
    }

    /**
     * Get Game URL
     */
    private function getGameUrl($requestData)
    {
        $data['currency'] = true;
        $params = explode('|', $requestData['gameCode']);
        try {
            $responseData = $this->oneGame->getGameUrlById('icore_onegame', $params[0], [
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
