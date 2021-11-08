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
    private $product;
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
    public function __construct($playerSession, $configs, $product, $views)
    {
        $this->playerSession = $playerSession;
        $this->product = $product;
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

        return [
            'search_blurb' => $pageContents['search_blurb']
                ?? "DR Showing {count} result/s for \"<strong>{keyword}</strong>\"",
            'search_no_result_msg' => $pageContents['search_no_result_msg']
                ?? "No search results for <strong>{keyword}</strong>.",
            'msg_recommended_available' => $pageContents['msg_recommended_available']
                ?? "You might want to try our recommended games.",
            'msg_no_recommended' => $pageContents['msg_no_recommended'] ?? "",
            'title_weight' => $config['title_weight'] ?? 0,
            'keywords_weight' => $config['keywords_weight'] ?? 0,
            'authenticated' => $this->playerSession->isLogin(),
            'pagerConfig' => $pager ?? [],
            'configs' => $ptplusGeneralConfig ?? [],
            'pageData' => $pageContents ?? [],
        ];
    }
}
