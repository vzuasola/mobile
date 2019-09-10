<?php

namespace App\MobileEntry\Module\GameIntegration\ExchangeLauncher;

use App\MobileEntry\Module\GameIntegration\ProviderTrait;
use App\Drupal\Config;
use App\Utils\Host;

class ExchangeLauncherModuleController
{
    use ProviderTrait;

    const KEY = 'exchange_launcher';

    private $rest;

    private $exchange;

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
    public function __construct($rest, $exchange, $config, $player, $playerSession)
    {
        $this->rest = $rest;
        $this->exchange = $exchange;
        $this->config = $config->withProduct('mobile-exchange');
        $this->player = $player;
        $this->playerSession = $playerSession;
    }

    /**
     * @{inheritdoc}
     */
    public function launch($request, $response)
    {
        $data['currency'] = false;

        if ($this->checkCurrency()) {
            $data = $this->getGameLobby();
        }

        return $this->rest->output($response, $data);
    }

    private function getGameLobby()
    {
        $data['currency'] = true;
        try {
            $exchangeConfig =  $this->config->getGeneralConfigById('games_exchange_provider');

            $siteDomain = Host::getDomain();
            $gameDomain = $exchangeConfig['exchange_tablet_url'];
            $query = $exchangeConfig['tablet_game_url'];

            $gameUri = "$gameDomain.$siteDomain/$query";

            $data['gameurl'] = $gameUri;
        } catch (\Exception $e) {
            $data = [];
        }

        return $data;
    }

    private function checkCurrency()
    {
        try {
            $exchangeConfig =  $this->config->getGeneralConfigById('games_exchange_provider');
            $currencies = explode("\r\n", $exchangeConfig['currency']);
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
