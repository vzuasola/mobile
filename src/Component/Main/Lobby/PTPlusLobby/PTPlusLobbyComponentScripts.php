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

        try {
            $settings =  $this->configs->withProduct('mobile-ptplus')
                ->getConfig('webcomposer_config.tournament_settings');
            $tournament['button_learn_more'] = $settings['button_learn_more'] ?? 'Learn More';
            $tournament['button_join'] = $settings['button_join'] ?? 'Join';
            $tournament['blurb_animation'] = $settings['enable_transition_api'] ?? 't-none';
            $tournament['ends_in'] = $settings['label_ends_in'] ?? 'Ends in';
            $tournament['days'] = $settings['label_days'] ?? 'Days';
            $tournament['hours'] = $settings['label_hours'] ?? 'Hours';
            $tournament['minutes'] = $settings['label_minutes'] ?? 'Minutes';
        } catch (\Exception $e) {
            $tournament = [];
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
            'tournamentSettings' => $tournament ?? [],
        ];
    }
}
