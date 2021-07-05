<?php

namespace App\MobileEntry\Module\GameIntegration\PTPlus;

use App\MobileEntry\Module\GameIntegration\ProviderTrait;
use App\Fetcher\Drupal\ViewsFetcher;

class PTPlusModuleController
{
    use ProviderTrait;

    const KEY = 'ptplus';

    private $rest;

    private $ptplus;

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
    public function __construct($rest, $ptplus, $config, $player, $viewsFetcher)
    {
        $this->rest = $rest;
        $this->ptplus = $ptplus;
        $this->config = $config->withProduct('mobile-soda-casino');
        $this->player = $player;
        $this->viewsFetcher = $viewsFetcher->withProduct('mobile-soda-casino');
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
            $requestData['lang'] = $this->languageCode($request);

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
        $providerProduct = $requestData['product'] ?? 'mobile-soda-casino';
        try {
            $responseData = $this->ptplus->getGameUrlById('icore_ptplus', $params[0], [
                'options' => [
                    'languageCode' => $requestData['lang'],
                    'providerProduct' => $providerProduct,
                    'gameType' => $params[1] ?? null
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
