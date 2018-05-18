<?php

namespace App\MobileEntry\Component\Main\Promotions;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class PromotionsComponent implements ComponentWidgetInterface
{
    private $views;
    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('views_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($views)
    {
        $this->views = $views;
    }

    /**
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate()
    {
        return '@component/Main/Promotions/template.html.twig';
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function getData()
    {
        try {
            $data['promotions_filters'] = $this->views->getViewById('promotion-filter');

        } catch (\Exception $e) {
            $data['promotions_filters'] = [];
        }

        return $data;
    }
}
