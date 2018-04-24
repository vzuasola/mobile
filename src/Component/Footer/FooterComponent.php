<?php

namespace App\MobileEntry\Component\Footer;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class FooterComponent implements ComponentWidgetInterface
{
    /**
     * @var App\Fetcher\Drupal\MenuFetcher
     */
    private $menuFetcher;

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
    public function __construct($menuFetcher)
    {
        $this->menuFetcher = $menuFetcher;
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
            $data['footer_menu'] = $this->menuFetcher
                ->getMultilingualMenu('mobile-footer');
        } catch (\Exception $e) {
            $data['footer_menu'] = [];
        }

        $data['copyright'] = 'Copyright';

        return $data;
    }
}
