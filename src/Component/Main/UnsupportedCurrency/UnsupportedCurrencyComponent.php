<?php

namespace App\MobileEntry\Component\Main\UnsupportedCurrency;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class UnsupportedCurrencyComponent implements ComponentWidgetInterface
{
    private $product;
    private $configs;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('product_resolver'),
            $container->get('config_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($product, $configs)
    {
        $this->product = $product;
        $this->configs = $configs->withProduct($product->getProduct());
    }

    /**
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate()
    {
        return '@component/Main/UnsupportedCurrency/template.html.twig';
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function getData()
    {
        $content = $this->configs->getConfig('webcomposer_config.page_not_found');
        return ['ucp_content' => $content['ucp_content']['value'] ?? ''];
    }
}
