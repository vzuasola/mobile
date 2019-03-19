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
     * Check provisioned user's preferred casino
     */
    public function preference($request, $response)
    {
        $data = [];
        $product = 'casino';
        $data['preferredProduct'] = $product;
        $data['success'] = true;
        $data['redirect'] = $this->getCasinoUrl($product);

        if ($this->playerSession->isLogin()) {

            $body = $request->getParsedBody();
            if ($this->isProvisioned('casino-gold')) {
                if (!empty($product['preferred_product'])) {
                    $this->setPreference($product['preferred_product']);
                }

                $data['preferredProduct'] = $this->getPreferenceProvisioned();
                $data['redirect'] = $this->getCasinoUrl($data['preferredProduct']);
            }
        }

        return $this->rest->output($response, $data);
    }

    /**
     * Check provisioned user's preferred casino. This is used to get login via
     * when user logs in in casino or casino-gold
     */
    public function preferredProduct($request, $response)
    {
        $data['preferredProduct'] = false;
        try {
            $param = $request->getParsedBody();
            if (isset($param['username'])) {
                $data['preferredProduct'] = 'casino';
                if ($this->isProvisioned('casino-gold', $param['username'])) {
                    $data['preferredProduct'] = $this->getPreferenceProvisioned(['username' => $param['username']]);
                }
            }
        } catch (\Exception $e) {
            $data['preferredProduct'] = false;
        }

        return $this->rest->output($response, $data);
    }

    /**
     * Check if user is provisioned
     * @param product string
     * @param username string
     * @return boolean
     */
    private function isProvisioned($product, $username = null)
    {
        try {
            $isProvisioned = $this->paymentAccount->hasAccount($product, $username);
        } catch (\Exception $e) {
            $isProvisioned = false;
        }

        return $isProvisioned;
    }

    /**
     * Set user's preferred casino
     * @param preferredCasino string
     */
    private function setPreference($preferredCasino)
    {
        $this->preferences->savePreference('casino.preferred', $preferredCasino);
    }

    /**
     * Get user's preferred casino.
     * @param username array
     * @return string
     */
    private function getPreferenceProvisioned($username = [])
    {
        $preferredCasinoPref = $this->preferences->getPreferences($username);
        $preferredCasino = $preference['casino.preferred'] ?? false;

        return $preferredCasino;
    }

    /**
     * Get casino url from config
     * @param product string
     * @return string
     */
    private function getCasinoUrl($product)
    {
        $casinoUrl = false;

        try {
            $casinoConfigs = $this->configs->getConfig('mobile_casino.casino_configuration');
            $casinoUrl = $product == 'casino_gold' ?  $casinoConfigs['casino_gold_url'] : $casinoConfigs['casino_url'];
            $casinoUrl = $this->parser->processTokens($casinoUrl);
        } catch (\Exception $e) {
            // do nothing
        }

        return $casinoUrl;
    }

}
