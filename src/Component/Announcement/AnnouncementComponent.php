<?php

namespace App\MobileEntry\Component\Announcement;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class AnnouncementComponent implements ComponentWidgetInterface
{
    /**
     * @var App\Fetcher\Drupal\views
     */
    private $views;

    /**
     * @var App\Fetcher\Drupal\configs
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
            $container->get('views_fetcher'),
            $container->get('player_session'),
            $container->get('config_fetcher')
        );
    }

    /**
     *
     */
    public function __construct($views, $playerSession, $configs)
    {
        $this->views = $views;
        $this->playerSession = $playerSession;
        $this->configs = $configs;
    }

    /**
     * {@inheritdoc}
     */
    public function getTemplate()
    {
        return '@component/Announcement/template.html.twig';
    }

    public function getData()
    {
        return [];
    }
}
