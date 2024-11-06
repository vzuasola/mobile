<?php

namespace App\MobileEntry\Component\Main\Lobby\PTPlusLobby;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;
use App\MobileEntry\Services\Product\Products;

/**
 *
 */
class PTPlusLobbyComponentScripts implements ComponentAttachmentInterface
{
    const PRODUCT = 'mobile-ptplus';
    private $configs;
    private $playerSession;
    private $views;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session'),
            $container->get('config_fetcher'),
            $container->get('product_resolver'),
            $container->get('views_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct(
        \App\Player\PlayerSession $playerSession,
        \App\Fetcher\Drupal\ConfigFetcher $configs,
        \App\MobileEntry\Services\Product\ProductResolver $product,
        \App\Fetcher\Drupal\ViewsFetcher $views
    ) {
        $this->playerSession = $playerSession;
        $this->configs = $configs;
        $this->views = $views->withProduct($product->getProduct());
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        try {
            $config = $this->configs->getConfig('games_search.search_configuration');
        } catch (\Exception $e) {
            $config = [];
        }

        try {
            $ptplusGeneralConfig = $this->configs->getConfig('ptplus.ptplus_configuration');
        } catch (\Exception $e) {
            $ptplusGeneralConfig = [];
        }

        try {
            $pager = $this->views->getViewById('games_list', ['pager' => 1]);
        } catch (\Exception $e) {
            $pager = [];
        }

        try {
            $pageContents = $this->views->getViewById('page_content_list');
        } catch (\Exception $e) {
            $pageContents = [];
        }

        foreach ($pageContents as $value) {
            $key =  $value['field_page_content_key'][0]['value'];

            if ('search_blurb' === $key) {
                $searchBlurb = $value['name'][0]['value'];
            } elseif ('search_no_result_msg' === $key) {
                $searchNoResult = $value['name'][0]['value'];
            } elseif ('msg_recommended_available' === $key) {
                $recommendedAvailable = $value['name'][0]['value'];
            } elseif ('msg_no_recommended' === $key) {
                $noRecommended = $value['name'][0]['value'];
            }
        }


        return [
            'search_blurb' => $searchBlurb
                ?? "Search results for ",
            'search_no_result_msg' => $searchNoResult
                ?? "No search results for ",
            'msg_recommended_available' => $recommendedAvailable
                ?? "Try out these popular games for",
            'msg_no_recommended' => $noRecommended ?? "",
            'title_weight' => $config['title_weight'] ?? 0,
            'keywords_weight' => $config['keywords_weight'] ?? 0,
            'authenticated' => $this->playerSession->isLogin(),
            'pagerConfig' => $pager ?? [],
            'configs' => $ptplusGeneralConfig ?? [],
            'pageData' => $pageContents ?? [],
        ];
    }
}
