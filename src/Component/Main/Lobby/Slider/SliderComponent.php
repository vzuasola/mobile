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

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('config_fetcher'),
            $container->get('views_fetcher'),
            $container->get('player_session')
        );
    }

    /**
     *
     */
    public function __construct($configs, $viewsFetcher, $playerSession)
    {
        $this->configs = $configs;
        $this->viewsFetcher = $viewsFetcher;
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
        $data = [];

        try {
            $data['slides'] = $this->viewsFetcher->getViewById('webcomposer_slider_v2');
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
}
