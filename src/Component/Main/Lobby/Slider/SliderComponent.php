<?php

namespace App\MobileEntry\Component\Main\Lobby\Slider;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class SliderComponent implements ComponentWidgetInterface
{
     /**
     * @var App\Fetcher\Drupal\ViewsFetcher
     */
    private $viewsFetcher;

    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $configs;

    /**
     * @var App\Player\PlayerSession
     */
    private $playerSession;

    private $product;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('product_resolver'),
            $container->get('config_fetcher'),
            $container->get('views_fetcher'),
            $container->get('player_session')
        );
    }

    /**
     *
     */
    public function __construct($product, $configs, $viewsFetcher, $playerSession)
    {
        $this->product = $product;
        $this->configs = $configs->withProduct($product->getProduct());
        $this->viewsFetcher = $viewsFetcher->withProduct($product->getProduct());
        $this->playerSession = $playerSession;
    }

    /**
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate()
    {
        return '@component/Main/Lobby/Slider/template.html.twig';
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function getData()
    {
        try {
            $data['product'] = [];
            if ($this->product->getProduct() != 'mobile-entrypage') {
                $data['product'] = ['product' => $this->product->getProduct()];
            }
        } catch (\Exception $e) {
            $data['product'] = [];
        }

        try {
            $sliders = $this->viewsFetcher->getViewById('webcomposer_slider_v2');
            $data['slides'] = $this->processSlides($sliders);
        } catch (\Exception $e) {
            $data['slides'] = [];
        }

        try {
            $sliderConfigs = $this->configs->getConfig('webcomposer_config.slider_v2_configuration');
        } catch (\Exception $e) {
            $data['configs'] = [];
        }

        $data['enable_transition_slider'] = $sliderConfigs['enable_transition_slider'] ?? 'none';

        try {
            $data['is_login'] = $this->playerSession->isLogin();
        } catch (\Exception $e) {
            $data['is_login'] = false;
        }
        return $data;
    }

    private function processSlides($data)
    {
        try {
            $sliders = [];
            foreach ($data as $slide) {
                $slider = [];
                $slider['show_both'] = $slide['field_log_in_state'] > 1;
                $slider['login_state'] = $slide['field_log_in_state'][0]['value'] ?? 0;
                $ribbonLabel = $slide['field_ribbon_product_label']['0']['value'] ?? false;
                $fieldProduct = '';
                $fieldProductId = '';
                if (isset($slide['field_product'])) {
                    $fieldProduct = $slide['field_product']['0']['name'][0]['value'] ?? '';
                    $fieldProductId = $slide['field_product']['0']['field_product_id'][0]['value'] ?? '';
                }

                $slider['default_ribbon'] = $ribbonLabel;
                $slider['product_ribbon_tag'] =
                    ($ribbonLabel) ? $ribbonLabel : $fieldProduct;
                $slider['bg_color'] = $slide['field_ribbon_background_color']['0']['color'] ?? '';
                $slider['text_color'] = $slide['field_ribbon_label_color']['0']['color'] ?? '';
                $slider['product'] = $fieldProductId;
                
                $slider['game_code'] = $slide['field_slider_game_code'][0]['value'] ?? '';
                $slider['game_provider'] = $slide['field_slider_game_provider'][0]['value'] ?? '';
                $slider['field_title'] = $slide['field_title'][0]['value'] ?? '';

                $slider['banner_url'] = $slide['field_banner_link'][0]['uri'] ?? '';
                $slider['banner_target'] = $slide['field_banner_link_target'][0]['value'] ?? '';
                $slider['banner_img'] = $slide['field_banner_image'][0]['url'] ?? '';
                $slider['banner_alt'] = $slide['field_banner_image'][0]['alt'] ?? '';
                $slider['banner_pos'] = $slide['field_content_position'][0]['value'] ?? '';
                $slider['banner_blurb'] = $slide['field_banner_blurb'][0]['value'] ?? '';

                if ($this->playerSession->isLogin()) {
                    $slider['banner_url'] = $slide['field_post_banner_link'][0]['uri'] ?? '';
                    $slider['banner_target'] = $slide['field_post_banner_link_target'][0]['value'] ?? '';
                    $slider['banner_img'] = slide['field_post_banner_image'][0]['url'] ?? '';
                    $slider['banner_alt'] = $slide['field_post_banner_image'][0]['alt'] ?? '';
                    $slider['banner_pos'] = $slide['field_post_content_position'][0]['value'] ?? '';
                    $slider['banner_blurb'] = $slide['field_post_banner_blurb'][0]['value'] ?? '';
                }

                $sliders[] = $slider;
            }
        } catch (\Exception $e) {
            $sliders = [];
        }
        return $sliders;
    }
}
