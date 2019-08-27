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
        $this->config = $config->withProduct('mobile-exchange');
        $this->player = $player;
        $this->playerSession = $playerSession;
    }

    /**
     * @{inheritdoc}
     */
    public function launch($request, $response)
    {
        $data['gameurl'] = false;
        $data['currency'] = false;

        if ($this->checkCurrency($request)) {
            $data = $this->getGameLobby($request, $response);
        }

        return $this->rest->output($response, $data);
    }

    private function getGameLobby($request, $response)
    {
        $data['currency'] = true;
        $requestData = $request->getParsedBody();
        try {
            $gpiConfig =  $this->config->getGeneralConfigById('games_exchange_provider');

            $siteDomain = Host::getDomain();
            $gameDomain = $gpiConfig['exchange_tablet_url'];
            $query = $gpiConfig['tablet_game_url'];

            $gameUri = "$gameDomain.$siteDomain/$query";

            $data['gameurl'] = $gameUri;
        } catch (\Exception $e) {
            $data = [];
        }

        return $data;
    }

    private function checkCurrency($request)
    {
        try {
            $config =  $this->config->getGeneralConfigById('games_exchange_provider');
            $currencies = explode("\r\n", $config['currency']);
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
