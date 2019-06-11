<?php

namespace App\MobileEntry\Module\GameIntegration\PGSoft;

use App\MobileEntry\Module\GameIntegration\ProviderTrait;

class PGSoftModuleController
{
    use ProviderTrait;

    const KEY = 'pgsoft';

    private $rest;

    private $pgSoft;

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
    public function __construct($rest, $pgSoft, $config, $player)
    {
        $this->rest = $rest;
        $this->pgSoft = $pgSoft;
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

            try {
                $responseData = $this->pgSoft->getGameUrlById('icore_pgs', $requestData['gameCode'], [
                    'options' => [
                        'languageCode' => $requestData['langCode'],
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
