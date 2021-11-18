<?php

namespace App\MobileEntry\Component\Menu;

/**
 *
 */
class MenuComponentController
{
    private $playerSession;
    private $viewFetcher;
    private $rest;
    /**
     * @var App\Fetcher\Integration\PreferencesFetcher
     */
    private $preferences;

    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $configs;

    /**
     * @var Accounts
     */
    private $accountService;

    private $parser;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session'),
            $container->get('views_fetcher'),
            $container->get('rest'),
            $container->get('accounts_service'),
            $container->get('token_parser'),
            $container->get('preferences_fetcher'),
            $container->get('config_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($playerSession, $viewFetcher, $rest, $accountService, $parser, $preferences, $configs)
    {
        $this->playerSession = $playerSession;
        $this->viewFetcher = $viewFetcher;
        $this->rest = $rest;
        $this->preferences = $preferences;
        $this->configs = $configs;
        $this->accountService = $accountService;
        $this->parser = $parser;
    }

    public function lobby($request, $response)
    {
        $data = [];
        $body = $request->getParsedBody();
        try {
            $data['lobby_url'] = '';
            if (!empty($body['product'])) {
                $productMenus = $this->viewFetcher->getViewById('mobile_product_menu');

                foreach ($productMenus as $productMenu) {
                    if (isset($productMenu['field_product_menu_id'][0]['value'])
                        && ($productMenu['field_product_menu_id'][0]['value'] == $body['product'])) {
                        $data['lobby_url'] = $productMenu['field_product_menu_url_post_log'][0]['uri'];
                        break;
                    }
                }
            }
        } catch (\Exception $e) {
            $data['lobby_url'] = '';
        }

        return $this->rest->output($response, $data);
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
                if (!empty($body['preferred_product'])) {
                    $this->setPreference($body['preferred_product']);
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
            $isProvisioned = $this->accountService->hasAccount($product, $username);
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
        return $preferredCasinoPref['casino.preferred'] ?? false;
    }

    /**
     * Get casino url from config
     * @param product string
     * @return string
     */
    private function getCasinoUrl($product)
    {
        $casinoUrl = '';

        try {
            if ($product) {
                $casinoConfigs = $this->configs->getConfig('mobile_casino.casino_configuration');
                $casinoUrl = $product == 'casino_gold' ?  $casinoConfigs['casino_gold_url']
                    : $casinoConfigs['casino_url'];
                $casinoUrl = $this->parser->processTokens($casinoUrl);
            }
        } catch (\Exception $e) {
            // do nothing
        }

        return $casinoUrl;
    }
}
