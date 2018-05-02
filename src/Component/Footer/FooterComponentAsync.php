<?php

namespace App\MobileEntry\Component\Footer;

use App\Plugins\ComponentWidget\AsyncComponentInterface;

class FooterComponentAsync implements AsyncComponentInterface
{
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
            $container->get('menu_fetcher_async')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($menus)
    {
        $this->menus = $menus;
    }


    /**
     * {@inheritdoc}
     */
    public function getDefinitions()
    {
        return [
            $this->menus->getMultilingualMenu('mobile-footer'),
        ];
    }
}
