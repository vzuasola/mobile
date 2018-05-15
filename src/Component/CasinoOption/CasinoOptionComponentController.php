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

        if ($this->playerSession->isLogin()) {
            try {
                $body = $request->getParsedBody();

                if (!empty($body['product'])) {
                    $this->preferences->savePreference('casino.preferred', $body['product']);
                    $data['casino_url'] = $this->getCasinoUrl($body['product']);

                    return $this->rest->output($response, $data);

                } else {
                    $preferences = $this->preferences->getPreferences();

                    if (!empty($preferences['casino.preferred'])) {
                        $data['casino_url'] = $this->getCasinoUrl($preferences['casino.preferred']);
                        
                    } else {
                        $data['casino_url'] = '';
                    }

                    return $this->rest->output($response, $data);
                }

            } catch (\Exception $e) {
                $data['casino_url'] = '';
            }
        }

        return $data['casino_url'] = '';
    }

    public function get_preference($request, $response)
    {
        $data = [];

        if ($this->playerSession->isLogin()) {
            try {
                $preferences = $this->preferences->getPreferences();
                if (!empty($preferences['casino.preferred'])) {
                    $data['casino_url'] = $this->getCasinoUrl($preferences['casino.preferred']);
                    return $response->withStatus(200)->withHeader('Location', $data['casino_url']);
                } else {
                    $data['casino_url'] = '';
                    return $this->rest->output($response, $data);
                }

            } catch (\Exception $e) {
                $data['casino_url'] = '';
            }
        }

        return $data['casino_url'] = '';
    }

    private function getCasinoUrl($product)
    {
        try {
            $casinoConfigs = $this->configs->getConfig('mobile_casino.casino_configuration');

            $casinoUrl = ($product == 'casino_gold') ? $casinoConfigs['casino_gold_url'] 
                : $casinoConfigs['casino_url'];
        } catch (\Exception $e) {
            $casinoUrl = '';
        }

        return $casinoUrl;
    }
}
