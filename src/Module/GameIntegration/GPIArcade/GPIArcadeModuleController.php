<?php

namespace App\MobileEntry\Module\GameIntegration\GPIArcade;

use App\MobileEntry\Module\GameIntegration\ProviderTrait;
use App\Drupal\Config;
use App\Fetcher\Drupal\ViewsFetcher;

class GPIArcadeModuleController
{
    use ProviderTrait;

    const KEY = 'gpi';

    private $rest;

    private $gpi;

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
            $container->get('game_provider_fetcher'),
            $container->get('config_fetcher'),
            $container->get('player'),
            $container->get('player_session'),
            $container->get('views_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($rest, $gpi, $config, $player, $playerSession, $viewsFetcher)
    {
        $this->rest = $rest;
        $this->gpi = $gpi;
        $this->config = $config->withProduct('mobile-arcade');
        $this->player = $player;
        $this->playerSession = $playerSession;
        $this->viewsFetcher = $viewsFetcher->withProduct('mobile-arcade');
    }

    /**
     * @{inheritdoc}
     */
    public function launch($request, $response)
    {
        $data['gameurl'] = false;
        $data['currency'] = false;

        if ($this->checkCurrency()) {
            $data = $this->getGameLobby($request);
        }

        return $this->rest->output($response, $data);
    }

    private function getGameLobby($request)
    {
        $data['currency'] = true;
        $requestData = $request->getParsedBody();
        try {
            $gpiConfig =  $this->config->getConfig('webcomposer_config.games_gpi_provider');
            $extraParams = Config::parse($gpiConfig['gpi_arcade_extra_params']);
            $sessiontokenizer = $this->playerSession->getToken();

            $domain = $gpiConfig['gpi_game_url'];
            $vendor = $gpiConfig['gpi_vendor_id'];
            $ticket = $sessiontokenizer . '.1037';
            $gameCode = $requestData['gameCode'];

            $args = array_merge([
                'lang' => $requestData['langCode'],
                'vendor' => $vendor,
                'ticket' => $ticket,
            ], $extraParams);

            if ($gameCode) {
                $args['game'] = $gameCode;
            }

            $query = http_build_query($args);

            $gameUri = "$domain?$query";

            $data['gameurl'] = $gameUri;
        } catch (\Exception $e) {
            $data['currency'] = true;
        }

        return $data;
    }

    private function checkCurrency()
    {
        try {
            $currencyConfig =  $this->config->getConfig('webcomposer_config.games_gpi_provider');
            $currencies = explode("\r\n", $currencyConfig['gpi_arcade_currency']);
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
