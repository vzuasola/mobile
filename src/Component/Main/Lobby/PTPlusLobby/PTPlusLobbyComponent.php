<?php
namespace App\MobileEntry\Component\Main\Lobby\PTPlusLobby;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class PTPlusLobbyComponent implements ComponentWidgetInterface
{
    private $viewFetcher;

    public static function create($container)
    {
        return new static(
            $container->get('views_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($view)
    {
        $this->viewFetcher = $view->withProduct('ptplus');
    }

    /**
     * {@inheritdoc}
     */
    public function getTemplate()
    {
        return '@component/Main/Lobby/PTPlusLobby/template.html.twig';
    }

    /**
     * {@inheritdoc}
     */
    public function getData()
    {
        $data = null;
        try {
            $data['ptplus'] = $this->viewFetcher->getViewById('ptplus');
        } catch (\Exception $e) {
            $data = [];
        }
        return $data;
    }
}
