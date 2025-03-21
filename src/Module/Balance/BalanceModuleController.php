<?php

namespace App\MobileEntry\Module\Balance;

use App\Drupal\Config;

/**
 *
 */
class BalanceModuleController
{
    const SPECIAL_BALANCE_BEHAVIORS = [
        'casino' => 1,
        'casino_gold' => 2,
        'poker' => 3,
        'oneworks' => 4,
        'shared_wallet' => 5,
        'als' => 6,
        // 'fish_hunter' => 7,
        'opus_live_dealer' => 8,
        // 'opus_keno' => 9,
        // 'esports' => 11,
        'soda_casino' => 13,
        'ptplus' => 15,
    ];

    const PARTNER_MATRIX_BEHAVIORS = [
        'shared_wallet' => 5,
        'als' => 6,
    ];

    const PRODUCT_MAPPING = [
        'mobile-entrypage' => 0,
        'mobile-games' => 5,
        'mobile-casino' => 1,
        'mobile-casino-gold' => 2,
        'mobile-live-dealer' => 5,
        'mobile-lottery' => 5,
        'mobile-arcade' => 5,
        'mobile-soda-casino' => 13,
        'mobile-virtuals' => 6,
        'mobile-ptplus' => 15
    ];

    private $rest;
    private $config;
    private $playerSession;
    private $user;
    private $territories;
    private $balance;
    private $lang;
    private $currency;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('rest'),
            $container->get('config_fetcher'),
            $container->get('player_session'),
            $container->get('user_fetcher'),
            $container->get('territory_blocking_fetcher'),
            $container->get('balance_fetcher'),
            $container->get('lang'),
            $container->get('currency_translation')
        );
    }

    /**
     * Public constructor
     */
    public function __construct(
        $rest,
        $config,
        $playerSession,
        $user,
        $territories,
        $balance,
        $lang,
        $currency
    ) {
        $this->rest = $rest;
        $this->config = $config;
        $this->playerSession = $playerSession;
        $this->user = $user;
        $this->territories = $territories;
        $this->balance = $balance;
        $this->lang = $lang;
        $this->currency = $currency;
    }

    /**
     *
     */
    public function balances($request, $response)
    {
        $data = [];
        $isLogin = $this->playerSession->isLogin();
        $matrix = false;
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
                $countryCode = $this->user->getPlayerDetails()['countryCode'];
                $matrix = $this->playerSession->getDetails()['isPlayerCreatedByAgent'] ?? false;
            } catch (\Exception $e) {
                // Do nothing
            }

            try {
                $territoriesMap = $this->territories->getRestrictedCountries();
                $territory = $request->getServerParams()['HTTP_X_CUSTOM_LB_GEOIP_COUNTRY'] ?? '';
            } catch (\Exception $e) {
                // Do nothing
            }

            try {
                $ids = self::SPECIAL_BALANCE_BEHAVIORS;
                if ($matrix) {
                    $ids = self::PARTNER_MATRIX_BEHAVIORS;
                }

                $balances = $this->balance->getBalanceByWalletIds(
                    ['ids' => $ids]
                )['balance'];

                $sumBalances = $this->manageBalance(
                    $balances,
                    $balanceMap,
                    $currency,
                    $currencyMap,
                    $territory,
                    $territoriesMap,
                    $countryCode,
                    'balance'
                );

                $totalBalance = $sumBalances['total_balance'];
                $data['map'] = self::PRODUCT_MAPPING;
                $data['balances'] = $sumBalances['balances'];
                $data['balance'] = number_format($totalBalance, 2, '.', ',');
                $data['format'] = $this->totalBalanceFormat($currency);
                $data['currency'] = $this->currency->getTranslation($currency);
                $data['err_message'] = $headerConfigs['balance_error_text_product'] ?? 'N/A';
            } catch (\Exception $e) {
                $data['message'] = $e->getMessage();
                $data['balance'] = $headerConfigs['balance_error_text_product'] ?? 'N/A';
            }
        }

        return $this->rest->output($response, $data);
    }

    private function manageBalance(
        &$balances,
        $balanceMap,
        $currency,
        $currencyMap,
        $territory,
        $territoriesMap,
        $countryCode,
        $type
    ) {
        $balancesArr = [];

        $balances = $this->includedBalance($balanceMap, $balances);
        $balances = $this->currencyFilter($currency, $currencyMap, $balances);
        $balances = $this->territoryFilter($territoriesMap, $territory, $balances, $countryCode);

        $balancesArr['total_balance'] = 0;
        foreach ($balances as $key => $value) {
            // Get the wallet types to be computed
            $types = array_intersect_key($value, array_flip(BalanceDefinition::WALLET_TYPE_MAPPING[$key]));
            $balancesArr['balances'][$key] = array_sum(array_values($types));
            $balancesArr['total_balance'] = $balancesArr['total_balance'] + $balancesArr['balances'][$key];
        }

        return $balancesArr;
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

        foreach ($currencyMap as $key => $currencies) {
            if (!in_array(strtoupper($currency), $currencies)) {
                unset($balances[$key]);
            }
        }

        return $balances;
    }

    /**
     *
     */
    private function territoryFilter($territoriesMapConfig, $territory, $balances, $countryCode)
    {
        if (!$territoriesMapConfig) {
            return $balances;
        }
        foreach ($territoriesMapConfig as $key => $territories) {
            if ((in_array($countryCode, $territories) || in_array($territory, $territories))
                && isset($balances[$key])) {
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
        if ((strtoupper($currency) === 'RMB' || strtoupper($currency) === 'MBC') &&
            in_array($this->lang, ['sc','ch'])
        ) {
            $format = '{total} {currency}';
        }
        return $format;
    }
}
