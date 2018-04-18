<?php

namespace App\Web\Widget\Menu;

use App\Plugins\Widget\MenuWidgetInterface;

/**
 *
 */
class Games implements MenuWidgetInterface
{
    /**
     *
     */
    public function alterData($data)
    {
        return $data;
    }

    /**
     *
     */
    public function getTemplate()
    {
        return '@site/widgets/menu/games.html.twig';
    }
}
