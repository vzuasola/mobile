<?php

namespace App\MobileEntry\Controller;

use App\BaseController;
use Slim\Exception\NotFoundException;

class NodeController extends BaseController
{
    /**
     *
     */
    public function view($request, $response, $args)
    {
        $path = $request->getUri()->getPath();
        $path = trim($path, '/');

        try {
            $node = $this->get('node_fetcher')->getNodeByAlias($path);
        } catch (\Exception $e) {
            throw new NotFoundException($request, $response);
        }

        $data['title'] = $node['title'][0]['value'];
        $data['node'] = $node;

        return $this->widgets->render($response, '@site/node.html.twig', $data);
    }
}
