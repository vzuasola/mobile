<?php

namespace App\MobileEntry\Module\GameIntegration\EzugiGaming;

use App\MobileEntry\Module\GameIntegration\ProviderTrait;
use App\Fetcher\Drupal\ViewsFetcher;

class EzugiGamingModuleController
{
    use ProviderTrait;

    const KEY = 'ezugi_gaming';

    private $rest;

    private $ezugi;

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
    public function __construct($rest, $ezugi, $config, $player, $viewsFetcher)
    {
        $this->rest = $rest;
        $this->ezugi = $ezugi;
        $this->config = $config->withProduct('mobile-live-dealer');
        $this->player = $player;
        $this->viewsFetcher = $viewsFetcher->withProduct('mobile-live-dealer');
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
                    'languageCode' =>  $this->languageCode($request),
                    'gameName' => $requestData['gameCode'],
                    'tableName' => $requestData['tableName']
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
}
