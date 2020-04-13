<?php

namespace App\MobileEntry\Module\GameIntegration\ExchangeLauncher;

use App\MobileEntry\Module\GameIntegration\ProviderTrait;
use App\Drupal\Config;
use App\Utils\Host;
use App\Fetcher\Drupal\ViewsFetcher;

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
     * @var ViewsFetcher $viewsFetcher
     */
    private $viewsFetcher;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('rest'),
            $container->get('config_fetcher'),
            $container->get('player'),
            $container->get('player_session'),
            $container->get('views_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($rest, $config, $player, $playerSession, $viewsFetcher)
    {
        $this->rest = $rest;
        $this->config = $config->withProduct('mobile-exchange');
        $this->player = $player;
        $this->playerSession = $playerSession;
        $this->viewsFetcher = $viewsFetcher->withProduct('mobile-exchange');
    }

    /**
     * @{inheritdoc}
     */
    public function launch($request, $response)
    {
        $data['currency'] = false;

        if ($this->checkCurrency()) {
            $requestData = $request->getParsedBody();
            $data = $this->getGameLobby();
            $data['gameCode'] = $requestData['gameCode'] ?? '';
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
            $data['currency'] = true;
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
