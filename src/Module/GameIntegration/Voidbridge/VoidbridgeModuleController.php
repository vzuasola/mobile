<?php

namespace App\MobileEntry\Module\GameIntegration\Voidbridge;

use App\MobileEntry\Module\GameIntegration\ProviderTrait;

class VoidbridgeModuleController
{
    use ProviderTrait;

    const KEY = 'voidbridge';

    private $rest;

    private $voidbridge;

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
    public function __construct($rest, $voidbridge, $config, $player)
    {
        $this->rest = $rest;
        $this->voidbridge = $voidbridge;
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
                $responseData = $this->voidbridge->getGameUrlById('icore_vb', $params[0], [
                    'options' => [
                        'languageCode' => $requestData['langCode'],
                        'userAgent' => $requestData['userAgent'],
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
