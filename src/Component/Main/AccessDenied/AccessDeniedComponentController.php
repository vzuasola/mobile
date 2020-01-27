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

    private $parser;

    private $asset;

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
            $container->get('token_parser'),
            $container->get('asset'),
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
        $parser,
        $asset,
        $url
    ) {
        $this->configs = $configs->withProduct($product->getProduct());
        $this->rest = $rest;
        $this->parser = $parser;
        $this->asset = $asset;
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
            $body = $this->parser->processTokens($config['page_not_found_content_' . $product]['value']);
            $body = preg_replace_callback('/src="([^"]*)"/i', function ($imageSrc) {
                $productID = 'mobile-entrypage';
                if ($this->resolver->getProduct() === 'mobile-soda-casino') {
                    $productID = $this->resolver->getProduct();
                }
                return "src=\"" . $this->asset->generateAssetUri(
                    $imageSrc[1],
                    ['product' => $productID]
                ) . "\"";
            }, $body);

            $data = [
                'title' => $config['page_not_found_title_' . $product] ?? '404',
                'content' => $body ?? 'The page you are looking for does not exist'
            ];
        } catch (\Exception $e) {
            $data = [];
        }

        return $this->rest->output($response, $data);
    }
}
