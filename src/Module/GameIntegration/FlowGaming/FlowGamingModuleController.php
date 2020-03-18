<?php

namespace App\MobileEntry\Module\GameIntegration\FlowGaming;

use App\MobileEntry\Module\GameIntegration\ProviderTrait;
use App\Fetcher\Drupal\ViewsFetcher;

class FlowGamingModuleController
{
    use ProviderTrait;

    const KEY = 'flow_gaming';

    private $rest;

    private $flowGaming;

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
    public function __construct($rest, $flowGaming, $config, $player, $viewsFetcher)
    {
        $this->rest = $rest;
        $this->flowGaming = $flowGaming;
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
            $params = explode('|', $requestData['gameCode']);
            $platformCode = $params[1] ?? 'NETENT_CAS';
            try {
                $responseData = $this->flowGaming->getGameUrlById('icore_flg', $params[0], [
                    'options' => [
                        'languageCode' => $requestData['langCode'],
                        'platformCode' => $platformCode
                    ]
                ]);
                if ($responseData['url']) {
                    $data['gameurl'] = $responseData['url'];
                }
            } catch (\Exception $e) {
                $data['currency'] = true;
            }
        }

        return $this->rest->output($response, $data);
    }
}
