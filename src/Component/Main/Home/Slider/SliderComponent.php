<?php

namespace App\MobileEntry\Component\Main\Home\Slider;

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
    private $configFetcher;

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
            $container->get('views_fetcher'),
            $container->get('player_session')
        );
    }

    /**
     *
     */
    public function __construct($viewsFetcher, $playerSession)
    {
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
        return '@component/Main/Home/Slider/template.html.twig';
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

        $data['is_login'] = $this->playerSession->isLogin();
        return $data;
    }
}
