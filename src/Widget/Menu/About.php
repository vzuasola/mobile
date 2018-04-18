<?php

namespace App\Web\Widget\Menu;

use App\Plugins\Widget\MenuWidgetInterface;

/**
 *
 */
class About implements MenuWidgetInterface
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
        return '@site/widgets/menu/about.html.twig';
    }
}
