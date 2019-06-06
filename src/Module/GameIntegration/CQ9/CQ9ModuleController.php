<?php

namespace App\MobileEntry\Module\GameIntegration\CQ9;

use App\MobileEntry\Module\GameIntegration\ProviderTrait;

class CQ9ModuleController
{
    use ProviderTrait;

    const KEY = 'cq9';

    private $rest;

    private $cq9;

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
    public function __construct($rest, $cq9, $config, $player)
    {
        $this->rest = $rest;
        $this->cq9 = $cq9;
        $this->config = $config->withProduct('mobile-games');
        $this->player = $player;
    }

    /**
     * @{inheritdoc}
     */
    public function launch($request, $response)
    {
        $data['gameurl'] = false;
        $data['currency'] = false;
        if ($this->checkCurrency()) {
            $data['currency'] = true;
            $requestData = $request->getParsedBody();
            $params = explode('|', $requestData['gameCode']);

            try {
                $responseData = $this->cq9->getGameUrlById('icore_cq9', $params[0], [
                    'options' => [
                        'languageCode' => $requestData['langCode'],
                        'providerProduct' => $params[1] ?? null,
                    ]
                ]);
                if ($responseData['url']) {
                    $data['gameurl'] = $responseData['url'];
                }
            } catch (\Exception $e) {
                $data = [];
            }
        }

        return $this->rest->output($response, $data);
    }
}
