<?php

namespace App\MobileEntry\Component\CasinoOption;

/**
 *
 */
class CasinoOptionComponentController
{
    private $playerSession;
    private $preferences;
    private $rest;
    private $configs;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session'),
            $container->get('preferences_fetcher'),
            $container->get('rest'),
            $container->get('config_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($playerSession, $preferences, $rest, $configs)
    {
        $this->playerSession = $playerSession;
        $this->preferences = $preferences;
        $this->rest = $rest;
        $this->configs = $configs;
    }

    public function preference($request, $response)
    {
        $data = [];

        try {
            $body = $request->getParsedBody();

            if (!empty($body['preferred_casino'])) {
                $this->preferences->savePreference('casino.preferred', $body['preferred_casino']);
                $data['casino_url'] = $this->getCasinoConfig($body['preferred_casino']);
                $data['casino_url'] = $this->getCasinoUrl($preferences['casino.preferred']);

                return $this->rest->output($response, $data);

            } else {
                $preferences = $this->preferences->getPreferences();
                $data['casino_url'] = $this->getCasinoUrl($preferences['casino.preferred']);
            }

        } catch (\Exception $e) {
            
        }
        
    }

    private function getCasinoUrl($product)
    {

        try {
            $casinoConfigs = $this->config->getConfig('mobile_casino.casino_configuration');

            $casinoConfig['url'] = ($product == 'casino_gold') ? $casinoConfigs['casino_gold_url'] 
                : $casinoConfigs['casino_url'];
        } catch (\Exception $e) {
            $casinoConfig['url'] = '';
        }

        return $casinoConfig;
    }
}
