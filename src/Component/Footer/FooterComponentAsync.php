<?php

namespace App\MobileEntry\Component\Footer;

use App\Plugins\ComponentWidget\AsyncComponentInterface;

class FooterComponentAsync implements AsyncComponentInterface
{
    /**
     * @var App\Fetcher\AsyncDrupal\ViewsFetcher
     */
    private $views;

    /**
     * @var App\Fetcher\Drupal\menus
     */
    private $menus;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('views_fetcher_async'),
            $container->get('menu_fetcher_async')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($views, $menus)
    {
        $this->views = $views;
        $this->menus = $menus;
    }


    /**
     * {@inheritdoc}
     */
    public function getDefinitions()
    {
        return [
            $this->views->getViewById('mobile_sponsor_list'),
            $this->menus->getMultilingualMenu('mobile-footer'),
        ];
    }
}
