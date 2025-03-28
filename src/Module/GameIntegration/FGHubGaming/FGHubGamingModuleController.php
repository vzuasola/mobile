<?php

namespace App\MobileEntry\Module\GameIntegration\FGHubGaming;

use App\MobileEntry\Module\GameIntegration\ProviderTrait;
use App\Fetcher\Drupal\ViewsFetcher;

class FGHubGamingModuleController
{
    use ProviderTrait;

    const KEY = 'fghub_gaming';

    private $rest;

    private $fghubGaming;

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
    public function __construct($rest, $fghubGaming, $config, $player, $viewsFetcher)
    {
        $this->rest = $rest;
        $this->fghubGaming = $fghubGaming;
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

            if ($requestData['gameCode'] && $requestData['gameCode'] !== 'undefined') {
                $data = $this->getGameUrl($requestData);
            }
        }

        return $this->rest->output($response, $data);
    }

    /**
     * Get Game URL
     */
    private function getGameUrl($requestData)
    {
        $data['currency'] = true;
        $params = explode('|', $requestData['gameCode']);
        $providerProduct = $params[1] ?? 'games';
        try {
            $responseData = $this->fghubGaming->getGameUrlById('icore_fghub', $params[0], [
                'options' => [
                    'languageCode' => $requestData['langCode'],
                    'providerProduct' => $providerProduct
                ]
            ]);

            if ($responseData['url']) {
                $data['gameurl'] = $responseData['url'];
            }
        } catch (\Exception $e) {
            die($e->getMessage());
            $data['currency'] = true;
        }

        return $data;
    }
}
