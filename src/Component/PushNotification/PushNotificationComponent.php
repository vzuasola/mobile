<?php

namespace App\MobileEntry\Component\PushNotification;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class PushNotificationComponent implements ComponentWidgetInterface
{
    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $pnxconfig;

    /**
     * @var App\Player\PlayerSession
     */
    private $playerSession;

    /**
     * @var string
     */
    private $playerLocale;
    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('config_fetcher'),
            $container->get('user_fetcher'),
            $container->get('player_session')
        );
    }

    /**
     * Public constructor
     */
    public function __construct(
        $config,
        $user,
        $playerSession
    ) {
        $this->config = $config;
        $this->user = $user;
        $this->playerSession = $playerSession;
    }

    /**
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate()
    {
        return '@component/PushNotification/template.html.twig';
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function getData()
    {
        $this->pnxconfig = $this->config->getConfig('webcomposer_config.pushnx_configuration_v2');

        $data['title'] = $this->pnxconfig['title'];
        $data['dismiss_button_label'] = $this->pnxconfig['dismiss_button_label'];

        return $data;
    }
}
