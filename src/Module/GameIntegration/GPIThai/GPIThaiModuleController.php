<?php

namespace App\MobileEntry\Module\GameIntegration\GPIThai;

use App\MobileEntry\Module\GameIntegration\ProviderTrait;
use App\Drupal\Config;
use App\Fetcher\Drupal\ViewsFetcher;

class GPIThaiModuleController
{
    use ProviderTrait;

    const KEY = 'gpi_thai';

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
        $this->config = $config->withProduct('mobile-lottery');
        $this->player = $player;
        $this->playerSession = $playerSession;
        $this->viewsFetcher = $viewsFetcher->withProduct('mobile-lottery');
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
            $gpiConfig =  $this->config->getConfig('webcomposer_config.games_gpi_provider');
            $providerMapping = Config::parse($gpiConfig['gpi_thai_lottey_language_mapping'] ?? '');
            $extraParams = Config::parse($gpiConfig['gpi_thai_lottey_extra_params']);
            $sessiontokenizer = $this->playerSession->getToken();

            $domain = $gpiConfig['gpi_game_url'];
            $versionno = $gpiConfig['gpi_lottery_keno_version_no'];
            $vendor = $gpiConfig['gpi_vendor_id'];
            $ticket = $sessiontokenizer . '.1036';

            $args = array_merge([
                'lang' => $requestData['langCode'],
                'vendor' => $vendor,
                'ticket' => $ticket,
                'version' => $versionno,
            ], $extraParams);

            $query = http_build_query($args);

            $gameUri = "$domain?$query";

            $data['gameurl'] = $gameUri;
        } catch (\Exception $e) {
            $data['currency'] = true;
        }

        return $data;
    }

    private function checkCurrency($request)
    {
        try {
            $config =  $this->config->getConfig('webcomposer_config.games_gpi_provider');
            $currencies = explode("\r\n", $config['gpi_thai_lottey_currency']);
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
