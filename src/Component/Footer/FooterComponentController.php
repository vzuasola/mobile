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

    private $asset;

    private $idDomain;

    private $product;

    private $currentLanguage;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('menu_fetcher'),
            $container->get('rest'),
            $container->get('asset'),
            $container->get('id_domain'),
            $container->get('product_resolver'),
            $container->get('lang')
        );
    }

    /**
     *
     */
    public function __construct(
        $menus,
        $rest,
        $asset,
        $idDomain,
        $product,
        $currentLanguage
    ) {
        $this->menus = $menus;
        $this->rest = $rest;
        $this->asset = $asset;
        $this->idDomain = $idDomain;
        $this->product = $product;
        $this->currentLanguage = $currentLanguage;
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
            $data['languageVisibility'] = $this->idDomain->isLangSelectorHidden();
        } catch (\Exception $e) {
            $data['footer_menu'] = [];
        }

        $this->cleanFooterMenu($data['footer_menu']);

        return $this->rest->output($response, $data);
    }

    private function cleanFooterMenu(&$footerMenu)
    {
        if ($footerMenu) {
            foreach ($footerMenu as $key => $link) {
                if ($footerMenu[$key]['uri'] === '') {
                        $footerMenu[$key]['uri'] = $this->asset->generateAssetUri(
                            $this->currentLanguage . '/',
                            $link['uri']
                        );
                }

                if (($this->idDomain->isLangSelectorHidden()) &&
                    strpos($link['attributes']['class'], 'language-trigger') !== false
                ) {
                    unset($footerMenu[$key]);
                }
            }
        }
    }
}
