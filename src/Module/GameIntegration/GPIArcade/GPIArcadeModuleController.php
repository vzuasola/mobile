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

        if ($this->checkCurrency($request)) {
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

    private function checkCurrency($request)
    {
        try {
            $params = $request->getParsedBody();
            $subProvider = $params['subprovider'] ?? false;
            $playerCurrency = $this->player->getCurrency();

            if ($subProvider) {
                $supportedCurrency = $this->viewsFetcher->getViewById(
                    'games_subproviders',
                    ['name' => $subProvider]
                )[0]['supported_currency'] ?? '';

                // If the game has a subprovider currency restriction, verify if the user met the restriction
                if ($supportedCurrency) {
                    return in_array(
                        $playerCurrency,
                        preg_split("/\r\n|\n|\r/", $supportedCurrency)
                    );
                }
            }

            $currencyConfig =  $this->config->getConfig('webcomposer_config.games_gpi_provider');
            $currencies = explode("\r\n", $currencyConfig['gpi_arcade_currency']);


            if (in_array($playerCurrency, $currencies)) {
                return true;
            }
        } catch (\Exception $e) {
            // Do nothing
        }
        return false;
    }
}
