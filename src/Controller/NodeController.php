<?php

namespace App\MobileEntry\Controller;

use App\BaseController;
use Slim\Exception\NotFoundException;
use App\MobileEntry\Services\Product\Products;

class NodeController extends BaseController
{
    /**
     *
     */
    public function view($request, $response, $args)
    {
        $path = $request->getUri()->getPath();
        $path = trim($path, '/');

        $product = $this->get('product_resolver')->getProduct();
        $alias = str_replace("mobile-", "", $product);
        if (isset($args['id']) && in_array($args['id'], Products::PRODUCT_ALIAS[$alias])) {
            $path = $args['params'];
        }

        try {
            $node = $this->get('node_fetcher')->withProduct($product)->getNodeByAlias($path);
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
                throw new NotFoundException($request, $response);
            }
        }
    }
}
