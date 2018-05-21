<?php

namespace App\MobileEntry\Component\Main\Promotions;

/**
 *
 */
class PromotionsComponentController
{
    private $rest;

    /**
     * @var App\Player\PlayerSession
     */
    private $playerSession;

    /**
     * @var App\Fetcher\Integration\PreferencesFetcher
     */
    private $views;

    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $configs;

    /**
     * @var App\Fetcher\Integration\PaymentAccountFetcher
     */
    private $paymentAccount;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session'),
            $container->get('views_fetcher'),
            $container->get('rest'),
            $container->get('config_fetcher'),
            $container->get('payment_account_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($playerSession, $views, $rest, $configs, $paymentAccount)
    {
        $this->playerSession = $playerSession;
        $this->views = $views;
        $this->rest = $rest;
        $this->configs = $configs;
        $this->paymentAccount = $paymentAccount;
    }

    public function list($request, $response)
    {
        try {
            $promoPerProduct = [];
            $promotions = $this->views->getViewById('promotions');
            $isLogin = $this->playerSession->isLogin();
            $isProvisioned = $this->isPlayerProvisioned();

            foreach ($promotions as $promotion) {
                $filterId = $promotion['field_product_category'][0]['field_product_filter_id'][0]['value'];
                $availability = count($promotion['field_promo_availability']) > 1 ?
                    $promotion['field_promo_availability'] :
                    $promotion['field_promo_availability'][0]['value'];

                $ribbonLabel = $promotion['field_ribbon_label'][0]['value'] ?? '';
                $ribbonColor = $promotion['field_ribbon_background_color'][0]['color'] ?? '';

                $promoProperties = [
                    'title' => $promotion['title'][0]['value'],
                    'product' => $filterId,
                    'ribbon_label' =>  $ribbonLabel,
                    'ribbon_bg_color' => $ribbonColor,
                ];

                if ($isLogin && ($availability == '1' || is_array($availability))) {
                    $markIsFeatured = $promotion['field_post_mark_as_featured'][0]['value'];

                    if ($promotion['field_casino_gold_only'][0]['value'] && !$isProvisioned) {
                        continue;
                    }

                    $promoProperties = $promoProperties + [
                        'thumbnail'=> $promotion['field_post_thumbnail_image'][0]['url'] ?? '#',
                        'summary_url' => $promotion['field_post_summary_url'] ?? ['uri' => '#', 'title' => ''],
                        'summary_url_target'=> $promotion['field_post_summary_url_target'][0]['value'] ?? '',
                        'summary_blurb' => $promotion['field_post_summary_blurb'][0]['value'] ?? '',
                        'hide_countdown' => $promotion['field_post_hide_countdown'][0]['value'] ?? true,
                        'hide_promotion' => $promotion['field_post_hide_promotion'][0]['value'] ?? true,
                        'is_featured' => $promotion['field_post_mark_as_featured'][0]['value'] ?? false
                    ];
                } else {
                    $markIsFeatured = $promotion['field_mark_as_featured'][0]['value'];

                    $promoProperties = $promoProperties + [
                        'thumbnail'=> $promotion['field_thumbnail_image'][0]['url'] ?? '#',
                        'summary_url' => $promotion['field_summary_url'] ?? ['uri' => '#', 'title' => ''],
                        'summary_url_target'=> $promotion['field_summary_url_target'][0]['value'] ?? '',
                        'summary_blurb' => $promotion['field_summary_blurb'][0]['value'] ?? '',
                        'hide_countdown' => $promotion['field_hide_countdown'][0]['value'] ?? true,
                        'hide_promotion' => $promotion['field_hide_promotion'][0]['value'] ?? true,
                        'is_featured' => $promotion['field_mark_as_featured'][0]['value'] ?? false
                    ];
                }

                if ($markIsFeatured) {
                    $promoPerProduct['featured'][] = $promoProperties + ['category' => 'featured'];
                }
                $promoPerProduct[$filterId][] = $promoProperties + ['category' => $filterId];
            }

            $data = $promoPerProduct;
        } catch (\Exception $e) {
            $data = [];
        }

        return $this->rest->output($response, $data);
    }

    private function isPlayerProvisioned()
    {
        $isProvisioned = false;

        try {
            if ($this->playerSession->isLogin()) {
                $isProvisioned = $this->paymentAccount->hasAccount('casino-gold');
            }
        } catch (\Exception $e) {
            $isProvisioned = false;
        }

        return $isProvisioned;
    }
}
