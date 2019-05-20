<?php

namespace App\MobileEntry\Module\GameIntegration\MicroGaming;

use App\Drupal\Config;

class MicroGamingModuleController
{
    const KEY = 'micro_gaming';

    private $rest;

    private $microGaming;

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
    public function __construct($rest, $microGaming, $config, $player)
    {
        $this->rest = $rest;
        $this->microGaming = $microGaming;
        $this->config = $config->withProduct('mobile-games');
        $this->player = $player;
    }

    public function unsupported($request, $response)
    {
        try {
            $config =  $this->config->getConfig('webcomposer_config.unsupported_currency');
            $providerMapping = Config::parse($config['game_provider_mapping'] ?? '');
            $data['provider'] = $providerMapping[self::KEY];
            $data['title'] = $config['unsupported_currencies_title'] ?? '';
            $data['message'] =
                $config['unsupported_currencies_message']['value'] ?? '';
            $data['button'] = $config['unsupported_currencies_button'] ?? '';
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
            $requestData = $request->getParsedBody();
            if ($requestData['gameCode'] || $requestData['gameCode'] !== 'undefined') {
                $data = $this->getGameUrl($request, $response);
            }

            if (!$requestData['gameCode'] || $requestData['gameCode'] === 'undefined') {
                $data = $this->getGameLobby($request, $response);
            }
        }

        return $this->rest->output($response, $data);
    }

    private function checkCurrency()
    {
        try {
            $config =  $this->config->getConfig('webcomposer_config.icore_games_integration');
            $currencies = explode("\r\n", $config[self::KEY . '_currency']);
            $playerCurrency = $this->player->getCurrency();

            if (in_array($playerCurrency, $currencies)) {
                return true;
            }
        } catch (\Exception $e) {
            // Do nothing
        }
        return false;
    }

    private function getGameLobby($request, $response)
    {
        $data['currency'] = true;
        $requestData = $request->getParsedBody();

        try {
            $responseData = $this->microGaming->getLobby('icore_mg', [
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
        return $data;
    }

    private function getGameUrl($request, $response)
    {
        $data['currency'] = true;
        $requestData = $request->getParsedBody();

        try {
            $params = explode('|', $requestData['gameCode']);
            $gameCode = $params[0];
            $productProvider = $params[1] ?? null;

            $responseData = $this->microGaming->getGameUrlById('icore_mg', $gameCode , [
                'options' => [
                    'languageCode' => $requestData['langCode'],
                    'playMode' => 'true',
                    'providerProduct' => $productProvider,
                ]
            ]);
            if ($responseData['url']) {
                $data['gameurl'] = $responseData['url'];
            }
        } catch (\Exception $e) {
            $data = [];
        }
        return $data;
    }
}
