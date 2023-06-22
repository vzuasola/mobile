<?php

namespace App\MobileEntry\Controller;

use App\BaseController;
use App\MobileEntry\Services\Product\Products;

class GameIFrameController extends BaseController
{
    /**
     *
     */
    public function view($request, $response, $args)
    {
        try {
            $alias = $args['id'];
            $product = Products::PRODUCT_MAPPING[$alias] ?? "mobile-entrypage";
            $config = $this->get('config_fetcher')
                ->withProduct($product)
                ->getConfig('webcomposer_config.header_configuration');
        } catch (\Exception $e) {
            $config = [];
        }

        $data['title'] = $config["lobby_page_title"] ?? $this->get('translation_manager')->getTranslation('home');
        $data['is_front'] = true;
        $data['product'] = $product;
        return $this->widgets->render($response, '@site/gameiframe.html.twig', $data);
    }
}
