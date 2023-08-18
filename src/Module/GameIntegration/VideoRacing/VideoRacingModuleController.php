<?php

namespace App\MobileEntry\Module\GameIntegration\VideoRacing;

use App\MobileEntry\Module\GameIntegration\ProviderTrait;
use App\Fetcher\Drupal\ViewsFetcher;

class VideoRacingModuleController
{
    use ProviderTrait;

    const KEY = 'video_racing';

    private $rest;

    private $videoRacing;

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
    public function __construct($rest, $videoRacing, $config, $player, $viewsFetcher)
    {
        $this->rest = $rest;
        $this->videoRacing = $videoRacing;
        $this->config = $config->withProduct('mobile-lottery');
        $this->player = $player;
        $this->viewsFetcher = $viewsFetcher->withProduct('mobile-lottery');
    }

    /**
     * @{inheritdoc}
     */
    public function launch($request, $response)
    {
        $data['gameurl'] = false;
        $data['currency'] = false;

        $countryRestriction = $this->checkCountryRestriction($request);

        if ($countryRestriction['restricted']) {
            $data['restricted_country'] = $countryRestriction;
            return $this->rest->output($response, $data);
        }

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
            $responseData = $this->videoRacing->getLobby('icore_vr', [
                'options' => [
                    'languageCode' => $this->languageCode($request),
                ]
            ]);
            if ($responseData) {
                $data['gameurl'] = $responseData['LobbyUrl'];
            }
        } catch (\Exception $e) {
            $data['currency'] = true;
        }

        return $data;
    }

    private function getGameUrl($request, $response)
    {
        $data['currency'] = true;
        $requestData = $request->getParsedBody();
        $params = explode('|', $requestData['gameCode']);

        try {
            $responseData = $this->videoRacing->getGameUrlById('icore_vr', $params[0], [
                'options' => [
                    'languageCode' => $this->languageCode($request),
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
