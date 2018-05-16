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
    private $paymentAccount;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session'),
            $container->get('preferences_fetcher'),
            $container->get('rest'),
            $container->get('config_fetcher'),
            $container->get('payment_account_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($playerSession, $preferences, $rest, $configs, $paymentAccount)
    {
        $this->playerSession = $playerSession;
        $this->preferences = $preferences;
        $this->rest = $rest;
        $this->configs = $configs;
        $this->paymentAccount = $paymentAccount;
    }

    public function preference($request, $response)
    {
        $data['success'] = false;

        if ($this->playerSession->isLogin()) {
            $data['success'] = true;

            try {
                $isProvisioned = $this->paymentAccount->hasAccount('casino-gold');
            } catch (\Exception $e) {
                $isProvisioned = false;
            }

            if ($isProvisioned) {
                try {
                    $body = $request->getParsedBody();

                    if (!empty($body['product'])) {
                        $this->preferences->savePreference('casino.preferred', $body['product']);
                        $data['lobby_url'] = $this->getCasinoUrl($body['product']);
                    } else {
                        $preferences = $this->preferences->getPreferences();

                        if (!empty($preferences['casino.preferred'])) {
                            $data['lobby_url'] = $this->getCasinoUrl($preferences['casino.preferred']);
                            $this->preferences->removePreference(['casino.preferred']);
                        } else {
                            $data['lobby_url'] = '';
                        }
                    }
                } catch (\Exception $e) {
                    $data['lobby_url'] = '';
                }
            } else {
                $data['lobby_url'] = $this->getCasinoUrl('casino');
            }
        }

        return $this->rest->output($response, $data);;
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
