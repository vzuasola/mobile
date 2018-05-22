<?php

namespace App\MobileEntry\Controller;

use App\Async\Async;
use App\BaseController;

class ExceptionController extends BaseController
{
    /**
     *
     */
    public function exceptionNotFound($request, $response)
    {
        $data['title'] = '404';

        return $this->widgets->render($response, '@site/page.html.twig', $data, [
            'components_override' => [
                'main' => 'access_denied',
            ],
        ]);
    }

    /**
     *
     */
    public function exceptionInternal($request, $response, $exception)
    {
        $data['title'] = '404';

        return $this->widgets->render($response, '@site/page.html.twig', $data, [
            'components_override' => [
                'main' => 'access_denied',
            ],
        ]);
    }
}
