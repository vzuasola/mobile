<?php

namespace App\MobileEntry\Component\Header;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class HeaderComponent implements ComponentWidgetInterface
{
    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $configs;

    /**
     * @var App\Player\PlayerSession
     */
    private $playerSession;

    /**
     * @var App\Player\Balance
     */
    private $balance;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('config_fetcher'),
            $container->get('player_session'),
            $container->get('balance_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($configs, $playerSession, $balance)
    {
        $this->configs = $configs;
        $this->playerSession = $playerSession;
        $this->balance = $balance;
    }

    /**
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate()
    {
        return '@component/Header/template.html.twig';
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function getData()
    {
        $data = [];

        $headerConfigs = $this->configs->getConfig('webcomposer_config.header_configuration');
        $loginConfigs = $this->configs->getConfig('webcomposer_config.login_configuration');

        $data['is_front'] = true;
        $data['logo_title'] = $headerConfigs['logo_title'] ?? 'Dafabet';
        $data['join_now_text'] = $headerConfigs['join_now_text'] ?? 'Join';
        $data['login_bottom_label'] = $loginConfigs['login_bottom_label'] ?? 'Login';

        // post login specific data

        $isLogin = $this->playerSession->isLogin();

        $data['is_login'] = $isLogin;

        if ($isLogin) {
            $data['username'] = $this->playerSession->getUsername();
            try {
                $balances = $this->balance->getBalances()['balance'];
                $balance = array_sum($balances);
                $data['balance'] = number_format($balance, 2, '.', '');
            } catch(\Exception $e) {
                $data['balance'] = 'N/A';
            }
        }
        return $data;
    }
}
