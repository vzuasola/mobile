<?php

namespace App\MobileEntry\Controller;

use App\BaseController;
use Slim\Exception\NotFoundException;

class SitemapController extends BaseController
{
    /**
     *
     */
    public function show($request, $response)
    {
        $data['title'] = 'Sitemap';

        return $this->view->render($response, '@site/page.html.twig', $data);
    }
}
