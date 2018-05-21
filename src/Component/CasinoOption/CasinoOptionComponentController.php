<?php

namespace App\MobileEntry\Component\CasinoOption;

use App\Cookies\Cookies;
use App\Utils\Host;

/**
 *
 */
class CasinoOptionComponentController
{
    private $rest;

    /**
     * @var App\Player\PlayerSession
     */
    private $playerSession;

    /**
     * @var App\Fetcher\Integration\PreferencesFetcher
     */
    private $preferences;

    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $configs;

    /**
     * @var App\Fetcher\Integration\PaymentAccountFetcher
     */
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
        $data = [];

        if ($this->playerSession->isLogin()) {
            $success = true;

            try {
                $isProvisioned = $this->paymentAccount->hasAccount('casino-gold');
            } catch (\Exception $e) {
                $isProvisioned = false;
                $success = false;
            }

            $body = $request->getParsedBody();

            if ($isProvisioned) {
                $redirect = $this->getPreferenceProvisioned($body);
            } else {
                $redirect = $this->getCasinoUrl('casino');
            }

            $data['success'] = $success;
            $data['redirect'] = $redirect;
        }

        return $this->rest->output($response, $data);
    }

    private function getPreferenceProvisioned($product)
    {
        $preferredCasinoUrl = false;

        try {
            if (!empty($product['product'])) {
                $preferredCasino = $product['product'];
                $this->preferences->savePreference('casino.preferred', $preferredCasino);
                $preferredCasinoUrl = $this->getCasinoUrl($product['product']);
            } else {
                $preferredCasino = $this->preferences->getPreferences();

                if (!empty($preferredCasino['casino.preferred'])) {
                    $preferredCasinoUrl = $this->getCasinoUrl($preferredCasino['casino.preferred']);
                }
            }

            $options = [
                'path' => '/',
                'domain' => Host::getDomain(),
                'expire' => 0
            ];

            Cookies::set('mobile_revamp_casino_pref', $preferredCasino, $options);
        } catch (\Exception $e) {
            // do nothing
        }

        return $preferredCasinoUrl;
    }

    private function getCasinoUrl($product)
    {
        $casinoUrl = false;

        try {
            $casinoConfigs = $this->configs->getConfig('mobile_casino.casino_configuration');
            $casinoUrl = $product == 'casino_gold' ? $casinoConfigs['casino_gold_url'] : $casinoConfigs['casino_url'];
        } catch (\Exception $e) {
            // do nothing
        }

        return $casinoUrl;
    }
}
