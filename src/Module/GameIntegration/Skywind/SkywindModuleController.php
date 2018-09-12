<?php

namespace App\MobileEntry\Module\GameIntegration\Skywind;

use App\Drupal\Config;

class SkywindModuleController
{
    const KEY = 'skywind';

    private $rest;

    private $skywind;

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
    public function __construct($rest, $skywind, $config, $player)
    {
        $this->rest = $rest;
        $this->skywind = $skywind;
        $this->config = $config->withProduct('mobile-games');
        $this->player = $player;
    }

    public function unsupported($request, $response)
    {
        try {
            $config =  $this->config->getConfig('webcomposer_config.icore_games_integration');
            $providerMapping = Config::parse($config['game_provider_mapping'] ?? '');
            $data['provider'] = $providerMapping[self::KEY];
            $data['title'] = $config['unsupported_currencies_title'] ?? $config['fallback_error_title'];
            $data['message'] =
                $config['unsupported_currencies_message']['value'] ?? $config['fallback_error_message']['value'];
            $data['button'] = $config['unsupported_currencies_button'] ?? $config['fallback_error_button'];
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
        $requestData = $request->getParsedBody();
        try {
            $responseData = $this->skywind->getGameUrlById('icore_sw', $requestData['gameCode'], [
                'options' => [
                    'languageCode' => $requestData['langCode'],
                    'playMode' => true
                ]
            ]);
            if ($responseData['url']) {
                $data['gameurl'] = $responseData['url'];
            }
        } catch (\Exception $e) {
            $data = [];
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
            return false;
        } catch (\Exception $e) {
            // Do nothing
        }
    }
}
