<?php

namespace App\MobileEntry\Controller;

use App\Async\Async;
use App\BaseController;
use App\MobileEntry\Services\Product\Products;
use Slim\Exception\NotFoundException;

class MaintenanceController extends BaseController
{
    /**
     *
     */
    public function maintenance($request, $response)
    {
        $data['title'] = 'Maintenance';

        return $this->widgets->render($response, '@site/page.html.twig', $data, [
            'components_override' => [
                'main' => 'maintenance',
            ],
        ]);
    }
}
