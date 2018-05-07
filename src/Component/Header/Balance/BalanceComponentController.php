<?php

namespace App\MobileEntry\Component\Header\Balance;

use App\Drupal\Config;

/**
 *
 */
class BalanceComponentController
{
    private $config;

    private $playerSession;

    private $user;

    private $territories;

    private $balance;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('config_fetcher'),
            $container->get('player_session'),
            $container->get('user_fetcher'),
            $container->get('territory_blocking_fetcher'),
            $container->get('balance_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($config, $playerSession, $user, $territories, $balance)
    {
        $this->config = $config;
        $this->playerSession = $playerSession;
        $this->user = $user;
        $this->territories = $territories;
        $this->balance = $balance;
    }

    /**
     *
     */
    public function balances($request)
    {
        $data = [];
        $isLogin = $this->playerSession->isLogin();

        $data['is_login'] = $isLogin;

        if ($isLogin) {
            try {
                $headerConfigs = $this->config->getConfig('webcomposer_config.header_configuration');
                $balanceMap = $headerConfigs['balance_mapping'];
                $currencyMap = $headerConfigs['currency_balance_mapping'];
            } catch (\Exception $e) {
                // Do nothing
            }

            try {
                $currency = $this->user->getPlayerDetails()['currency'];
            } catch (\Exception $e) {
                // Do nothing
            }

            try {
                $territoriesMap = $this->territories->getRestrictedCountries();
                $territory = $request->getHeader('HTTP_X_CUSTOM_LB_GEOIP_COUNTRY')[0] ?? '';
            } catch (\Exception $e) {
                // Do nothing
            }

            try {
                $balances = $this->balance->getBalances()['balance'];

                $balances = $this->includedBalance($balanceMap, $balances);
                $balances = $this->currencyFilter($currency, $currencyMap, $balances);
                $balances = $this->territoryFilter($territoriesMap, $territory, $balances);

                $totalBalance = array_sum($balances);
                $data['balance'] = number_format($totalBalance, 2, '.', ',');
            } catch (\Exception $e) {
                $data['message'] = $e->getMessage();
                $data['balance'] = $headerConfigs['balance_error_text_product'] ?? 'N/A';
            }
        }

        return $data;
    }

    /**
     *
     */
    private function includedBalance($balanceMapConfig, $balances)
    {
        $balanceMap = Config::parse($balanceMapConfig);
        if (!$balanceMap) {
            return $balances;
        }
        return array_intersect_key($balances, $balanceMap);
    }

    /**
     *
     */
    private function currencyFilter($currency, $currencyMapConfig, $balances)
    {
        $currencyMap = Config::parseCommaDelimited($currencyMapConfig);
        if (!$currencyMap) {
            return $balances;
        }
        $map = [];
        foreach ($currencyMap as $key => $currencies) {
            if (in_array(strtoupper($currency), $currencies)) {
                $map[$key] = $currencies;
            }
        }

        return array_intersect_key($balances, $map);
    }

    /**
     *
     */
    private function territoryFilter($territoriesMapConfig, $territory, $balances)
    {
        foreach ($territoriesMapConfig as $key => $territories) {
            if (in_array($territory, $territories) && isset($balances[$key])) {
                unset($balances[$key]);
            }
        }
        return $balances;
    }
}
