<?php

namespace App\MobileEntry\Component\CasinoOption;

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
        $data['success'] = false;

        if ($this->playerSession->isLogin()) {
            $data['success'] = true;

            try {
                $isProvisioned = $this->paymentAccount->hasAccount('casino-gold');
            } catch (\Exception $e) {
                $isProvisioned = false;
            }

            if ($isProvisioned) {
                $body = $request->getParsedBody();

                $data['lobby_url'] = $this->getPreferenceProvisioned($body);
            } else {
                $data['lobby_url'] = $this->getCasinoUrl('casino');
            }
        }

        return $this->rest->output($response, $data);
    }

    private function getPreferenceProvisioned($product)
    {
        try {
            if (!empty($product['product'])) {
                $this->preferences->savePreference('casino.preferred', $product['product']);
                $preferredCasino = $this->getCasinoUrl($product['product']);
            } else {
                $userPreferences = $this->preferences->getPreferences();

                $preferredCasino = '';
                if (!empty($userPreferences['casino.preferred'])) {
                    $preferredCasino = $this->getCasinoUrl($userPreferences['casino.preferred']);
                }
            }
        } catch (\Exception $e) {
            $preferredCasino = '';
        }

        return $preferredCasino;
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
