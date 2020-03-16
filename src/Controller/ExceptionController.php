<?php

namespace App\MobileEntry\Controller;

use App\Async\Async;
use App\BaseController;
use App\MobileEntry\Services\Product\Products;
use Slim\Exception\NotFoundException;

class ExceptionController extends BaseController
{
    /**
     *
     */
    public function exceptionNotFound($request, $response, $args = [])
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
            $data['title'] = '404';

            return $this->widgets->render($response, '@site/page.html.twig', $data, [
                'components_override' => [
                    'main' => 'access_denied',
                ],
            ]);
        }

        $data['title'] = $node['title'][0]['value'];
        $data['node'] = $node;

        return $this->widgets->render($response, '@site/node.html.twig', $data);
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
