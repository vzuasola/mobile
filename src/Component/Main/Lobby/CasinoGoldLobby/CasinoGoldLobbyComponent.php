<?php

namespace App\MobileEntry\Component\Main\Lobby\CasinoGoldLobby;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class CasinoGoldLobbyComponent implements ComponentWidgetInterface
{
    /**
     * @var App\Fetcher\Drupal\ViewsFetcher
     */
    private $views;

    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $configs;

    private $product;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('views_fetcher'),
            $container->get('config_fetcher'),
            $container->get('product_resolver')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($views, $configs, $product)
    {
        $this->views = $views;
        $this->product = $product;
        $this->configs = $configs->withProduct($product->getProduct());
    }

    /**
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate()
    {
        return '@component/Main/Lobby/CasinoLobby/template.html.twig';
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function getData()
    {
        try {
            $searchConfig = $this->configs->getConfig('games_search.search_configuration');
        } catch (\Exception $e) {
            $searchConfig = [];
        }

        try {
            $filterView = $this->views->withProduct($this->product->getProduct());
            $filters = $filterView->getViewById('games_filter');
            $parentFilters = $this->getFilterParent($filters);
            $dataFilters = $this->getFilters($filters);
        } catch (\Exception $e) {
            $searchConfig = [];
        }

        return [
            'title' => $searchConfig['search_title'] ?? "",
            'filter_title' => $searchConfig['games_filter_title'] ?? "",
            'games_filter_submit' => $searchConfig['games_filter_submit'] ?? "Submit",
            'games_filter_cancel' => $searchConfig['games_filter_cancel'] ?? "Cancel",
            'filters' => $dataFilters ?? [],
            'parent_filters' => $parentFilters ?? [],
        ];
    }

    private function getFilters($filters)
    {
        try {
            $dataFilters = [];
            foreach ($filters as $filter) {
                $dataFilters[] = $this->proccessFilter($filter);
            }
        } catch (\Exception $e) {
            $dataFilters = [];
        }

        return $dataFilters;
    }

    private function proccessFilter($data)
    {
        try {
            $filter = [];
            $filter['name'] = $data['field_games_filter_label'][0]['value'];
            $filter['value'] = $data['field_games_filter_value'][0]['value'];
            $filter['parent'] = $data['parent']['field_games_filter_value'][0]['value'];
        } catch (\Exception $e) {
            $filter = [];
        }

        return $filter;
    }

    private function getFilterParent($filters)
    {
        try {
            $parents = [];
            foreach ($filters as $filter) {
                if (!isset($parents[$filter['parent']['field_games_filter_value'][0]['value']])) {
                    $parents[$filter['parent']['name'][0]['value']]['name']
                        = $filter['parent']['field_games_filter_label'][0]['value'];
                    $parents[$filter['parent']['name'][0]['value']]['value']
                        = $filter['parent']['field_games_filter_value'][0]['value'];
                }
            }
        } catch (\Exception $e) {
            $parents = [];
        }

        return $parents;
    }
}
