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

        $this->checkAccess($node, $request, $response);

        $data['title'] = $node['title'][0]['value'];
        $data['node'] = $node;

        return $this->widgets->render($response, '@site/node.html.twig', $data);
    }

    /**
     * Check if a specified node has access
     */
    private function checkAccess($node, $request, $response)
    {
        try {
            $state = (integer) $this->get('player_session')->isLogin();
        } catch (\Exception $e) {
            $state = 0;
        }

        if (isset($node['field_promo_availability'])) {
            $states = array_column((array) $node['field_promo_availability'], 'value');

            if (!in_array($state, $states)) {
                print_r('testing');
                die();
                throw new NotFoundException($request, $response);
            }
        }
    }
}
