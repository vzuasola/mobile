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

    private $parser;

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
            $container->get('accounts_service'),
            $container->get('token_parser')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($playerSession, $preferences, $rest, $configs, $paymentAccount, $parser)
    {
        $this->playerSession = $playerSession;
        $this->preferences = $preferences;
        $this->rest = $rest;
        $this->configs = $configs;
        $this->paymentAccount = $paymentAccount;
        $this->parser = $parser;
    }

    /**
     *
     */
    public function preference($request, $response)
    {
        $data = [];
        $product = 'casino';
        $data['preferredProduct'] = $product;
        $data['success'] = true;
        $data['redirect'] = $this->getCasinoUrl($product);

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
                $product = $this->getPreferenceProvisioned($body);
                $data['preferredProduct'] = $product;
                $data['redirect'] = ($product) ? $this->getCasinoUrl($product) : '';
                $data['success'] = $success;
            }
        }

        return $this->rest->output($response, $data);
    }

    /**
     *
     */
    private function getPreferenceProvisioned($product)
    {
        $preferredCasino = false;
        try {
            if (!empty($product['product'])) {
                $preferredCasino = $product['product'];
                $this->preferences->savePreference('casino.preferred', $preferredCasino);

                $this->setLegacyPrefCookie($preferredCasino);
            } else {
                $preferredCasinoPref = $this->preferences->getPreferences();

                if (!empty($preferredCasinoPref['casino.preferred'])) {
                    $preferredCasino = $preferredCasinoPref['casino.preferred'];

                    $this->setLegacyPrefCookie($preferredCasino);
                }
            }
        } catch (\Exception $e) {
            // do nothing
        }

        return $preferredCasino;
    }

    /**
     *
     */
    private function getCasinoUrl($product)
    {
        $casinoUrl = false;

        try {
            $casinoConfigs = $this->configs->getConfig('mobile_casino.casino_configuration');
            $casinoUrl = $product == 'casino_gold' ? $casinoConfigs['casino_gold_url'] : $casinoConfigs['casino_url'];
            $casinoUrl = $this->parser->processTokens($casinoUrl);
        } catch (\Exception $e) {
            // do nothing
        }

        return $casinoUrl;
    }

    /**
     *
     */
    private function setLegacyPrefCookie($preferredCasino)
    {
        $options = [
            'path' => '/',
            'domain' => Host::getDomain(),
            'expire' => 0,
        ];

        Cookies::set('mobile_revamp_casino_prefer', $preferredCasino, $options);
    }
}
