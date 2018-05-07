<?php

namespace App\MobileEntry\Component\Header\Balance;

/**
 *
 */
class BalanceComponentController
{
    private $playerSession;

    private $balance;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session'),
            $container->get('balance_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($playerSession, $balance)
    {
        $this->playerSession = $playerSession;
        $this->balance = $balance;
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
                $balances = $this->balance->getBalances()['balance'];
                $totalBalance = array_sum($balances);
                $data['balance'] = number_format($totalBalance, 2, '.', ',');
            } catch (\Exception $e) {
                $data['balance'] = 'N/A';
            }
        }

        return $data;
    }
}
