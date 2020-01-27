<?php

namespace App\MobileEntry\Component\Main\AccessDenied;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class AccessDeniedComponentController
{
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
        $configs,
        $product,
        $rest,
        $url
    ) {
        $this->configs = $configs->withProduct($product->getProduct());
        $this->rest = $rest;
        $this->url = $url;
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function accessDenied($request, $response)
    {
        try {
            $config = $this->configs->getConfig('webcomposer_config.webcomposer_site_page_not_found');
            $product = $request->getParam('product') ? $request->getParam('product') : 'mobile-entrypage';

            $data = [
                'title' => $config['page_not_found_title_' . $product] ?? '404',
                'content' => $config['page_not_found_content_' . $product]['value']
                ?? 'The page you are looking for does not exist'
            ];
        } catch (\Exception $e) {
            $data = [];
        }

        return $this->rest->output($response, $data);
    }
}
