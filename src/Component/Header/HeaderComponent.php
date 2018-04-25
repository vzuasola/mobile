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
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('config_fetcher'),
            $container->get('player_session')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($configs, $playerSession)
    {
        $this->configs = $configs;
        $this->playerSession = $playerSession;
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
        $data['is_login'] = $this->playerSession->isLogin();

        return $data;
    }
}
