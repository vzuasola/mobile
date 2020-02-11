<?php

namespace App\MobileEntry\Component\Main\Maintenance;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class MaintenanceComponentController
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
        $this->configs = $configs;
        $this->product = $product;
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
    public function maintenance($request, $response)
    {
        try {
            $config = $this->configs->getConfig('webcomposer_config.webcomposer_site_maintenance');
            $productAttr = $request->getParam('product') ? $request->getParam('product') : 'mobile-entrypage';
            $body = $this->parser->processTokens($config['maintenance_content_' . $productAttr]['value']);
            $body = preg_replace_callback('/src="([^"]*)"/i', function ($imageSrc) {
                return "src=\"" . $this->asset->generateAssetUri(
                    $imageSrc[1],
                    ['product' => 'mobile-entrypage']
                ) . "\"";
            }, $body);

            $data = [
                'title' => $config['maintenance_title_' . $productAttr] ?? 'Maintenance',
                'content' => $body ?? 'Maintenance in progress'
            ];
        } catch (\Exception $e) {
            $data = [];
        }

        return $this->rest->output($response, $data);
    }
}
