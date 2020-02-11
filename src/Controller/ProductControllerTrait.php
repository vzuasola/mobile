<?php

namespace App\MobileEntry\Controller;

use App\MobileEntry\Services\PublishingOptions\PublishingOptions;

/**
 * Trait for games
 */
trait ProductControllerTrait
{
    private function checkMaintenance($response)
    {
        return false;
        $data = [];
        return $this->widgets->render($response, '@site/page.html.twig', $data, [
            'components_override' => [
                'main' => 'maintenance',
            ],
        ]);
    }
}
