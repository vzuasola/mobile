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
        'opus_keno' => 9,
        'exchange' => 10,
        'esports' => 11,
    ];

    const PRODUCT_MAPPING = [
        'mobile-entrypage' => 0,
        'mobile-games' => 5,
        'mobile-casino' => 1,
        'mobile-casino-gold' => 2,
        'mobile-live-dealer' => 5,
        'mobile-exchange' => 5,
        'mobile-arcade' => 5,
        'mobile-lottery' => 5,
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
                if (strtolower($currency) !== "inr") {
                    unset($ids['exchange']);
                }
                $balances = $this->balance->getBalanceByProductIds(
                    ['ids' => $ids]
                )['balance'];

                $bonuses = $this->balance->getBonusBalanceByProductIds(
                    ['ids' => $ids]
                )['balance'];

                // We'll remove the OW Sports bonus, since it's already part of the "realmoney" balance
                unset($bonuses[self::SPECIAL_BALANCE_BEHAVIORS['oneworks']]);

                // We'll remove the Esports bonus, since it's already part of the "realmoney" balance
                unset($bonuses[self::SPECIAL_BALANCE_BEHAVIORS['esports']]);

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

                $sumBalance = $sumBalances['balances'];

                $sumBonuses = $this->manageBalance(
                    $bonuses,
                    $balanceMap,
                    $currency,
                    $currencyMap,
                    $territory,
                    $territoriesMap,
                    $countryCode,
                    'bonus'
                );

                $sumBonus = $sumBonuses['balances'];
                $totalBalance = $sumBalance + $sumBonus;

                $data['map'] = self::PRODUCT_MAPPING;
                $data['balances'] = $balances;
                $data['reserveBalances'] = $sumBalances['reserveBalances'] ?? 0;
                $data['nonWithdrawableBalances'] = $sumBalances['nonWithdrawableBalances'] ?? 0;
                $data['bonuses'] = $bonuses;
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
        $balances,
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

        if ($type == 'balance') {
            $reserveBalance = [];
            $nonWithdrawableBalance = [];

            if (isset($balances[self::SPECIAL_BALANCE_BEHAVIORS['shared_wallet']])) {
                $reserveBalance = $this->balance->getReservedBalanceByProductIds(
                    [
                    'ids' => [self::SPECIAL_BALANCE_BEHAVIORS['shared_wallet']],
                    ]
                )['balance'];
                $balancesArr['reserveBalances'] = $reserveBalance;
            }

            $nonWithdrawableBalance = $this->balance->getNonWithdrawableBalanceByProductIds(
                [
                    'ids' => [
                        self::SPECIAL_BALANCE_BEHAVIORS['oneworks'],
                        self::SPECIAL_BALANCE_BEHAVIORS['als'],
                        self::SPECIAL_BALANCE_BEHAVIORS['esports']
                    ]
                ]
            )['balance'];
            $balancesArr['nonWithdrawableBalances'] = $nonWithdrawableBalance;

            foreach ($balances as $key => $value) {
                if (isset($reserveBalance[$key])) {
                    $balances[$key] += $reserveBalance[$key];
                }

                if (isset($nonWithdrawableBalance[$key])) {
                    $balances[$key] += $nonWithdrawableBalance[$key];
                }
            }
        }

        $balancesArr['balances'] = array_sum($balances);

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
