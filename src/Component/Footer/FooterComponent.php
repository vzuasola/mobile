<?php

namespace App\MobileEntry\Component\Footer;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class FooterComponent implements ComponentWidgetInterface
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
            $container->get('menu_fetcher')
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
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate()
    {
        return '@component/Footer/template.html.twig';
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function getData()
    {
        $data = [];

        try {
            $data['footer_menu'] = $this->menus->getMultilingualMenu('mobile-footer');
        } catch (\Exception $e) {
            $data['footer_menu'] = [];
        }

        $data['copyright'] = 'Copyright';

        return $data;
    }
}
