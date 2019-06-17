<?php

namespace App\MobileEntry\Component\Main\Lobby\Home\Download;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class DownloadComponentController
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
    public function downloads($request, $response)
    {
        try {
            $data['downloads_menu']  = $this->menus->getMultilingualMenu('mobile-downloads');
        } catch (\Exception $e) {
            $data['downloads_menu'] = [];
        }

        try {
            $data['all_apps_text'] = $this->configs->getConfig('mobile_entrypage.entrypage_configuration');
        } catch (\Exception $e) {
            $data['all_apps_text'] = [];
        }

        return $this->rest->output($response, $data);
    }

    private function procesDownloads($data, $options)
    {
        try {
            $downloads = [];
            foreach ($data as $download) {
                $properties = [];

                // $properties['title'] = $download['title'][0]['value'];
                $downloadUrl = $download['downloads_menu']['uri'] ?? '';
                $properties['download_url'] = $this->url->generateUri($downloadUrl, ['skip_parsers' => true]);
                $properties['all_apps_text'] = $download['all_apps_text'][0]['value'] ?? '';

                $downloads[] = $properties;
            }
        } catch (\Exception $e) {
            d($e);
            $downloads = [];
        }

        return $downloads;
    }
}
