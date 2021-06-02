<?php

namespace App\MobileEntry\Module\GameIntegration\JSystem;

use App\MobileEntry\Module\GameIntegration\ProviderTrait;
use App\Fetcher\Drupal\ViewsFetcher;

class JSystemModuleController
{
    use ProviderTrait;

    const KEY = 'jsystem';

    private $rest;

    private $jsystem;

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
    public function __construct($rest, $jsystem, $config, $player, $viewsFetcher)
    {
        $this->rest = $rest;
        $this->jsystem = $jsystem;
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
            $data['currency'] = true;
            $requestData = $request->getParsedBody();

            try  {
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
            } catch (\Exception $e) {
                $data['currency'] = true;
            }
        }

        return $this->rest->output($response, $data);
    }

    private function getGameLobby($request)
    {
        $data['currency'] = true;
        $requestData = $request->getParsedBody();
        $params = explode('|', $requestData['gameCode']);

        try {
            $responseData = $this->jsystem->getLobby('icore_jsystem', [
                'options' => [
                    'languageCode' => $this->languageCode($request),
                    'providerProduct' => $params[1] ?? null,
                    'gameCode' => $params[0] ?? null,
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
        $params = explode('|', $requestData['gameCode']);
        try {
            $responseData = $this->jsystem->getGameUrlById('icore_jsystem', $params[0], [
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
