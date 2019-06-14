<?php

namespace App\MobileEntry\Module\GameIntegration\SolidGaming;

use App\MobileEntry\Module\GameIntegration\ProviderTrait;

class SolidGamingModuleController
{
    use ProviderTrait;

    const KEY = 'solid_gaming';

    private $rest;

    private $solidGaming;

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
    public function __construct($rest, $solidGaming, $config, $player)
    {
        $this->rest = $rest;
        $this->solidGaming = $solidGaming;
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
        if ($this->checkCurrency($request)) {
            $data['currency'] = true;
            $requestData = $request->getParsedBody();
            $params = explode('|', $requestData['gameCode']);

            try {
                $gameCode = $params[0];
                $productProvider = $params[1] ?? null;
                $responseData = $this->solidGaming->getGameUrlById('icore_sg', $gameCode, [
                    'options' => [
                        'languageCode' => $requestData['langCode'],
                        'providerProduct' => $productProvider,
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
