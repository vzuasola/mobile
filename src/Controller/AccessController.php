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
        $product = $this->get('product_resolver')->getProduct();
        $content = $this->get('config_fetcher')->withProduct($product)->getGeneralConfigById('page_not_found');
        $data = [
            'ucp_content' => $content['ucp_content']['value']
        ];

        return $this->view->render($response, '@site/unsupported-currency-page.html.twig', $data);
    }
}
