<?php

namespace App\MobileEntry\Component\Main\Lobby\Slider;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class SliderComponentController
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

    private $rest;

    private $asset;

    private $url;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('product_resolver'),
            $container->get('config_fetcher'),
            $container->get('views_fetcher'),
            $container->get('player_session'),
            $container->get('rest'),
            $container->get('asset'),
            $container->get('uri')
        );
    }

    /**
     *
     */
    public function __construct(
        $product,
        $configs,
        $viewsFetcher,
        $playerSession,
        $rest,
        $asset,
        $url
    ) {
        $this->product = $product;
        $this->configs = $configs->withProduct($product->getProduct());
        $this->viewsFetcher = $viewsFetcher->withProduct($product->getProduct());
        $this->playerSession = $playerSession;
        $this->rest = $rest;
        $this->asset = $asset;
        $this->url = $url;
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
    public function sliders($request, $response)
    {
        try {
            $data['product'] = [];
            $params = $request->getQueryParams();
            if (isset($params['product']) && $params['product'] != 'mobile-entrypage') {
                $product = $params['product'];
                $this->configs = $this->configs->withProduct($product);
                $this->viewsFetcher = $this->viewsFetcher->withProduct($product);
                $data['product'] = ['product' => $product];
            }
        } catch (\Exception $e) {
            $data['product'] = [];
        }

        try {
            $sliders = $this->viewsFetcher->getViewById('webcomposer_slider_v2');
            $data['slides'] = $this->processSlides($sliders, $data['product']);
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

        return $this->rest->output($response, $data);
    }

    private function processSlides($data, $options)
    {
        try {
            $sliders = [];
            foreach ($data as $slide) {
                $slider = [];

                $dateStart = $slide['field_publish_date'][0]['value'] ?? '';
                $dateEnd = $slide['field_unpublish_date'][0]['value'] ?? '';
                $slider['published'] = $this->checkIfPublished(
                    $dateStart,
                    $dateEnd
                );

                $showBoth = count($slide['field_log_in_state']) > 1;

                $loginState = $slide['field_log_in_state'][0]['value'] ?? 0;

                if (!$showBoth && $loginState != $this->playerSession->isLogin()) {
                    $slider['published'] = false;
                }

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

                $sliderUrl = $slide['field_banner_link'][0]['uri'] ?? '';
                $slider['banner_url'] = $this->url->generateUri($sliderUrl, ['skip_parsers' => true]);

                $slider['banner_target'] = $slide['field_banner_link_target'][0]['value'] ?? '';

                $sliderImg = $slide['field_banner_image'][0]['url'] ?? '';
                $slider['banner_img'] = $this->asset->generateAssetUri($sliderImg, $options);
                $slider['banner_alt'] = $slide['field_banner_image'][0]['alt'] ?? '';
                $slider['banner_pos'] = $slide['field_content_position'][0]['value'] ?? '';
                $slider['banner_blurb'] = $slide['field_banner_blurb'][0]['value'] ?? '';

                if ($this->playerSession->isLogin()) {
                    $sliderUrl = $slide['field_post_banner_link'][0]['uri'] ?? '';
                    $slider['banner_url'] = $this->url->generateUri($sliderUrl, ['skip_parsers' => true]);

                    $slider['banner_target'] = $slide['field_post_banner_link_target'][0]['value'] ?? '';

                    $sliderImg = $slide['field_post_banner_image'][0]['url'] ?? '';
                    $slider['banner_img'] = $this->asset->generateAssetUri($sliderImg, $options);

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

    private function checkIfPublished($dateStart, $dateEnd)
    {
        if (!$dateStart && !$dateEnd) {
            return true;
        }

        $currentDate = new \DateTime(date("Y-m-d H:i:s"), new \DateTimeZone('UTC'));
        $currentDate = $currentDate->getTimestamp();
        if ($dateStart && $dateEnd) {
            $startDate = new \DateTime($dateStart, new \DateTimeZone('UTC'));
            $startDate = $startDate->setTimezone(new \DateTimeZone(date_default_timezone_get()));

            $endDate = new \DateTime($dateEnd, new \DateTimeZone('UTC'));
            $endDate = $endDate->setTimezone(new \DateTimeZone(date_default_timezone_get()));

            if ($startDate->getTimestamp() <= $currentDate && $endDate->getTimestamp() >= $currentDate) {
                return true;
            }
        }

        if ($dateStart && !$dateEnd) {
            $startDate = new \DateTime($dateStart, new \DateTimeZone('UTC'));
            $startDate = $startDate->setTimezone(new \DateTimeZone(date_default_timezone_get()));
            if ($startDate->getTimestamp() <= $currentDate) {
                return true;
            }
        }

        if ($dateEnd && !$dateStart) {
            $endDate = new \DateTime($dateEnd, new \DateTimeZone('UTC'));
            $endDate = $endDate->setTimezone(new \DateTimeZone(date_default_timezone_get()));
            if ($endDate->getTimestamp() >=$currentDate) {
                return true;
            }
        }

        return false;
    }
}
