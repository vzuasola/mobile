<?php

namespace App\MobileEntry\Module\GameIntegration\SAGaming;

use App\Drupal\Config;

class SAGamingModuleController
{
    const KEY = 'sa_gaming';

    private $rest;

    private $saGaming;

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
    public function __construct($rest, $saGaming, $config, $player)
    {
        $this->rest = $rest;
        $this->saGaming = $saGaming;
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
            $data['currency'] = true;
            $requestData = $request->getParsedBody();
            $params = explode('|', $requestData['gameCode']);

            try {
                if (isset($params[0]) && isset($params[1])) {
                    $gameCode = $params[0];
                    $productProvider = $params[1];
                    $responseData = $this->saGaming->getGameUrlById('icore_sa', $gameCode, [
                        'options' => [
                            'languageCode' => $requestData['langCode'],
                            'providerProduct' => $productProvider,
                        ]
                    ]);
                    if ($responseData['url']) {
                        $data['gameurl'] = $responseData['url'];
                    }
                }
            } catch (\Exception $e) {
                $data = [];
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
}
