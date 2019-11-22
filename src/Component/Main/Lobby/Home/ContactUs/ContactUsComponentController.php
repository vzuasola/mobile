<?php

namespace App\MobileEntry\Component\Main\Lobby\Home\ContactUs;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class ContactUsComponentController
{
    /**
     * @var App\Fetcher\Drupal\MenuFetcher
     */
    private $menus;

    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $configs;

    private $product;

    private $rest;

    private $url;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('menu_fetcher'),
            $container->get('config_fetcher'),
            $container->get('product_resolver'),
            $container->get('rest'),
            $container->get('uri')
        );
    }

    /**
     *
     */
    public function __construct(
        $menus,
        $configs,
        $product,
        $rest,
        $url
    ) {
        $this->configs = $configs->withProduct($product->getProduct());
        $this->menus = $menus->withProduct($product->getProduct());
        $this->rest = $rest;
        $this->url = $url;
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function contactUs($request, $response)
    {
        try {
            $data['contact_menu']  = $this->menus->getMultilingualMenu('mobile-contact-us');
        } catch (\Exception $e) {
            $data['contact_menu'] = [];
        }

        try {
            $data['entrypage_config'] = $this->configs->getConfig('mobile_entrypage.entrypage_configuration');
        } catch (\Exception $e) {
            $data['entrypage_config'] = [];
        }

        return $this->rest->output($response, $data);
    }
}
