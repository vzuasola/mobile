<?php

namespace App\MobileEntry\Component\Header\Balance;

use App\Drupal\Config;
use App\Translations\Currency;

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

    private $lang;

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
            $container->get('balance_fetcher'),
            $container->get('lang')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($config, $playerSession, $user, $territories, $balance, $lang)
    {
        $this->config = $config;
        $this->playerSession = $playerSession;
        $this->user = $user;
        $this->territories = $territories;
        $this->balance = $balance;
        $this->lang = $lang;
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
                $data['format'] = $this->totalBalanceFormat($currency);
                $data['currency'] = $this->currencyTranslation($currency);
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

    /**
     * Format the total balance with the corresponding currency
     *
     * @param string $currency Registered currency of the player
     * @return string $format Balance formatting
     */
    private function totalBalanceFormat($currency)
    {
        $format = '{currency} {total}';
        // Format the balance display via current language
        if (strtoupper($currency) == 'RMB' && in_array($this->lang, ['sc','ch'])) {
            $format = '{total} {currency}';
        }
        return $format;
    }


    /**
     * Translate currency depending on current langauge
     *
     * @param string $currency Registered currency of the player
     * @return string $currency Translated currency of the player
     */
    private function currencyTranslation($currency)
    {
        switch ($this->lang) {
            case 'sc':
            case 'ch':
                if ($translated = Currency::getTranslation($currency)) {
                    $currency = $translated;
                }
                break;
            default:
                break;
        }

        return $currency;
    }
}
