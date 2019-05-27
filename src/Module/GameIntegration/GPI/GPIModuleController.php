<?php

namespace App\MobileEntry\Module\GameIntegration\GPI;

use App\Drupal\Config;

class GPIModuleController
{
    const KEY = 'gpi';

    private $rest;

    private $gpi;

    private $config;

    private $player;

    private $playerSession;

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
            $container->get('player_session')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($rest, $gpi, $config, $player, $playerSession)
    {
        $this->rest = $rest;
        $this->gpi = $gpi;
        $this->config = $config->withProduct('mobile-live-dealer');
        $this->player = $player;
        $this->playerSession = $playerSession;
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

    private function getGameLobby($request, $response)
    {
        $data['currency'] = true;
        $requestData = $request->getParsedBody();
        try {
            $gpiConfig =  $this->config->getConfig('webcomposer_config.games_gpi_provider');
            $providerMapping = Config::parse($gpiConfig['gpi_keno_language_mapping'] ?? '');
            $extraParams = Config::parse($gpiConfig['gpi_live_dealer_extra_params']);
            $sessiontokenizer = $this->playerSession->getToken();

            $domain = $gpiConfig['gpi_game_url'];
            $versionno = $gpiConfig['gpi_lottery_keno_version_no'];
            $vendor = $gpiConfig['gpi_vendor_id'];
            $ticket = $sessiontokenizer . '.1035';

            $args = array_merge([
                'lang' => $requestData['langCode'],
                'op' => $vendor,
                'token' => $ticket,
                'sys' => 'CUSTOM',
            ], $extraParams);

            $query = http_build_query($args);

            $gameUri = "$domain?$query";

            $data['gameurl'] = $gameUri;

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
            $responseData = $this->gpi->getGameUrlById('icore_ebet', $requestData['gameCode'], [
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

    private function checkCurrency()
    {
        try {
            $config =  $this->config->getConfig('webcomposer_config.games_gpi_provider');
            $currencies = explode("\r\n", $config['gpi_live_dealer_currency']);
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
