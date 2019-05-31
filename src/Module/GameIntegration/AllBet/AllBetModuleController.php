<?php

namespace App\MobileEntry\Module\GameIntegration\AllBet;

use App\Drupal\Config;

class AllBetModuleController
{
    const KEY = 'allbet';

    private $rest;

    private $allbet;

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
    public function __construct($rest, $allbet, $config, $player)
    {
        $this->rest = $rest;
        $this->allbet = $allbet;
        $this->config = $config->withProduct('mobile-live-dealer');
        $this->player = $player;
    }

    public function unsupported($request, $response)
    {
        try {
            $allbetConfig =  $this->config->getConfig('webcomposer_config.unsupported_currency');
            $providerMapping = Config::parse($allbetConfig['game_provider_mapping'] ?? '');
            $data['provider'] = $providerMapping[self::KEY];
            $data['title'] = $allbetConfig['unsupported_currencies_title'] ?? '';
            $data['message'] = $allbetConfig['unsupported_currencies_message']['value'] ?? '';
            $data['button'] = $allbetConfig['unsupported_currencies_button'] ?? '';
            $data['status'] = true;
        } catch (\Exception $e) {
            $data['status'] = false;
        }

        return $this->rest->output($response, $data);
    }

    /**
     * @{inheritdoc}
     */
    public function launch($request, $response)
    {
        $data['gameurl'] = false;
        $data['currency'] = false;

        if ($this->checkCurrency()) {
            $data = $this->getGameLobby($request, $response);
        }

        return $this->rest->output($response, $data);
    }

    private function getGameLobby($request, $response)
    {
        $data['currency'] = true;
        $requestData = $request->getParsedBody();

        try {
            $responseData = $this->allbet->getLobby('icore_ab', [
                'options' => [
                    'languageCode' => $requestData['langCode'],
                ]
            ]);
            if ($responseData) {
                $data['gameurl'] = $responseData;
            }
        } catch (\Exception $e) {
            $data = [];
        }

        return $data;
    }

    private function checkCurrency()
    {
        try {
            $allbetConfig =  $this->config->getConfig('webcomposer_config.icore_games_integration');
            $currencies = explode("\r\n", $allbetConfig[self::KEY . '_currency']);
            $playerCurrency = $this->player->getCurrency();

            if (in_array($playerCurrency, $currencies)) {
                return true;
            }
        } catch (\Exception $e) {
            // Do nothing
        }
        return false;
    }
}
