<?php

namespace App\MobileEntry\Module\GameIntegration\RubyPlay;

use App\MobileEntry\Module\GameIntegration\ProviderTrait;

class RubyPlayModuleController
{
    use ProviderTrait;

    const KEY = 'ruby_play';

    private $rest;

    private $rubyPlay;

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
    public function __construct($rest, $rubyPlay, $config, $player)
    {
        $this->rest = $rest;
        $this->rubyPlay = $rubyPlay;
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
                $responseData = $this->rubyPlay->getGameUrlById('icore_rp', $params[0], [
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
