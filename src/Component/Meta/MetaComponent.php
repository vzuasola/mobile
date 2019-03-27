<?php

namespace App\MobileEntry\Component\Meta;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class MetaComponent implements ComponentWidgetInterface
{
    private $request;

    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $configs;

    private $product;

    const HOME = [
        '/',
        '/games',
        '/casino',
        '/casino-gold'
    ];

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('router_request'),
            $container->get('config_fetcher'),
            $container->get('product_resolver')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($request, $configs, $product)
    {
        $this->request = $request;
        $this->configs = $configs;
        $this->product = $product;
    }

    /**
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate()
    {
        return '@component/Meta/template.html.twig';
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function getData()
    {
        $data = [];
        $data['is_front'] = false;
        try {
            if (in_array($this->request->getUri()->getPath(), self::HOME)) {
                $data['is_front'] = true;
            }
        } catch (\Exception $e) {
            // Do nothing
        }

        try {
            $headerConfigsByProduct = $this->configs
                ->withProduct($this->product->getProduct())
                ->getConfig('webcomposer_config.header_configuration');
        } catch (\Exception $e) {
            $headerConfigsByProduct = [];
        }

        $data['logo_title'] = $headerConfigsByProduct['logo_title'] ?? 'Dafabet';

        return $data;
    }
}
