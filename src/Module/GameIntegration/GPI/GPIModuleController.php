<?php

namespace App\MobileEntry\Module\GameIntegration\GPI;

use App\MobileEntry\Module\GameIntegration\ProviderTrait;

class GPIModuleController
{
    use ProviderTrait;

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

    /**
     * @{inheritdoc}
     */
    public function launch($request, $response)
    {
        $data['gameurl'] = false;
        $data['currency'] = false;

        if ($this->checkCurrency()) {
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
}
