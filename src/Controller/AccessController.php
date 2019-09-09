<?php

namespace App\MobileEntry\Controller;

use App\BaseController;
use App\Utils\Url;

class AccessController extends BaseController
{

    /**
     * Unsupported Currency Page
     */
    public function unsupportedCurrency($request, $response)
    {
        $data['title'] = 'Unsupported asdasd';
        return $this->widgets->render($response, '@site/page.html.twig', $data, [
            'components_override' => [
                'main' => 'ucp',
            ],
        ]);
    }
}
