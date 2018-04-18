<?php

namespace App\Web\Controller;

use App\Async\Async;
use App\Controller\NodeController as Base;

class NodeController extends Base
{
    /**
     *
     */
    public function viewNode($request, $response, $args, $node)
    {
        $data['data'] = $node;
        $data['title'] = $node['title'][0]['value'];

        return $this->view->render($response, '@site/page.html.twig', $data);
    }
}
