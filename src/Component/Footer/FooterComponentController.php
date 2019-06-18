<?php

namespace App\MobileEntry\Component\Footer;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class FooterComponentController
{
    /**
     * @var App\Fetcher\Drupal\MenuFetcher
     */
    private $menus;

    private $rest;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('menu_fetcher'),
            $container->get('rest')
        );
    }

    /**
     *
     */
    public function __construct(
        $menus,
        $rest
    ) {
        $this->menus = $menus;
        $this->rest = $rest;
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function footer($request, $response)
    {
        $data = [];

        try {
            $data['footer_menu'] = $this->menus->getMultilingualMenu('mobile-footer');
        } catch (\Exception $e) {
            $data['footer_menu'] = [];
            ddd($e->getMessage());
        }

        return $this->rest->output($response, $data);
    }
}
