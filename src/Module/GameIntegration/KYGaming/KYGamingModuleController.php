<?php

namespace App\MobileEntry\Module\GameIntegration\KYGaming;

use App\MobileEntry\Module\GameIntegration\ProviderTrait;
use App\Fetcher\Drupal\ViewsFetcher;

class KYGamingModuleController
{
    use ProviderTrait;

    const KEY = 'ky_gaming';

    private $rest;

    private $kyGaming;

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
    public function __construct($rest, $kyGaming, $config, $player, $viewsFetcher)
    {
        $this->rest = $rest;
        $this->kyGaming = $kyGaming;
        $this->config = $config->withProduct('mobile-arcade');
        $this->player = $player;
        $this->viewsFetcher = $viewsFetcher->withProduct('mobile-arcade');
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
                $data = $this->getGameUrl($request);
            }
        }

        return $this->rest->output($response, $data);
    }

    private function getGameUrl($request)
    {
        $data['currency'] = true;
        $requestData = $request->getParsedBody();

        try {
            $responseData = $this->kyGaming->getGameUrlById('icore_ky', $requestData['gameCode'], [
                'options' => [
                    'languageCode' => $requestData['langCode'],
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
