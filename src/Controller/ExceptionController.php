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

        return $this->widgets->render($response, '@site/404.html.twig', $data);
    }

    /**
     *
     */
    public function exceptionInternal($request, $response, $exception)
    {
        $data['title'] = '500';
        $data['configs']['exception_messages'] = $this->get('translation_manager')->getTranslations('exception');

        return $this->widgets->render($response, '@site/500.html.twig', $data)->withStatus(500);
    }
}
