<?php

namespace App\MobileEntry\Component\Header;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class HeaderComponentController
{
    /**
     * @var App\Fetcher\Drupal\MenuFetcher
     */
    private $rest;

    private $product;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('rest'),
            $container->get('product_resolver')
        );
    }

    /**
     *
     */
    public function __construct(
        $rest,
        $product
    ) {
        $this->rest = $rest;
        $this->product = $product;
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function getlogo($request, $response)
    {
        $params = $request->getQueryParams();
        $currentProduct = $params['product'] ?? 'mobile-entrypage';
        try {
            $headerConfigsByProduct = $this->configs
                ->withProduct($currentProduct)
                ->getConfig('webcomposer_config.header_configuration');
        } catch (\Exception $e) {
            $headerConfigsByProduct = [];
        }

        $lang = $params['language'] ?? 'en';
        $data['logo_title'] = $headerConfigsByProduct['logo_title'] ?? 'Dafabet';
        $data['logo_link'] = ($currentProduct == 'mobile-soda-casino') ? '/soda-casino' : '/';
        $data['product'] =  $currentProduct;
        $data['language'] = $lang;

        if ($lang == "ch" || $lang == "sc" && $currentProduct != "mobile-casino-gold" && $currentProduct != "mobile-soda-casino") {
            $data['logo'] = '/images/dafabet_logo_chinese.png';
        } elseif ($currentProduct == "mobile-casino-gold") {
            $data['logo'] = '/images/dafabet-gold-sc.png';
        } elseif ($currentProduct == "mobile-soda-casino") {
            $data['logo'] = '/images/soda-casino-logo.png';
        } else {
            $data['logo'] = '/images/dafabet_logo.png';
        }

        return $this->rest->output($response, $data);
    }
}
