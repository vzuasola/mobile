<?php

namespace App\MobileEntry\Middleware;

use App\Fetcher\Drupal\ConfigFetcher;
use App\MobileEntry\Services\Product\ProductResolver;
use App\Plugins\Middleware\ResponseMiddlewareInterface;
use Interop\Container\ContainerInterface;
use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;

/**
 *
 */
class ALSRedirect implements ResponseMiddlewareInterface
{

    /**
     * @var string[]
     */
    const ELIGIBLE_PRODUCTS = [
        'mobile-sports-df'
    ];

    /**
     * @var $lang string
     */
    private $lang;

    /**
     * @var $config ConfigFetcher
     */
    private $config;

    /**
     * @var $productResolver ProductResolver
     */
    private $productResolver;

    /**
     * @var $alsConfig array
     */
    private $alsConfig;

    /**
     * @var $maintenanceConfig array
     */
    private $maintenanceConfig;

    public function __construct(ContainerInterface $container)
    {
        $this->lang = $container->get('lang');
        $this->config = $container->get('config_fetcher');
        $this->productResolver = $container->get('product_resolver');
        try {
            $this->alsConfig = $this->config->getConfig('mobile_als.als_configuration');
            $this->maintenanceConfig = $this->config->getConfig('webcomposer_config.webcomposer_site_maintenance');
        } catch (\Exception $e) {
            $this->alsConfig = [];
            $this->maintenanceConfig = [];
        }
    }

    /**
     * {@inheritdoc}
     */
    public function handleResponse(RequestInterface &$request, ResponseInterface &$response)
    {
        try {
            if ($this->isEligible($request)) {
                // Get the redirect URL configured for this eligible ALS product
                $queryParams = $this->buildQueryParams($request);
                $redirect = "/$this->lang/api/plugins/module/route/als_integration/integrate?$queryParams";

                // Redirect the request to the appropriate redirect location
                $response = $response->withRedirect($redirect, 302);
            }
        } catch (\Exception $e) {
            // Do nothing
        }
    }

    /**
     * Verify if the current request should be handled with this middleware
     *
     * @return bool
     */
    private function isEligible(RequestInterface $request)
    {
        $product = $this->productResolver->getProduct() ?? false;

        // If the product is not in the eligible product, return immediately
        if (!in_array($product, self::ELIGIBLE_PRODUCTS)) {
            return false;
        }

        // If somehow the request has a data-widget-param this means that it was accessed via router
        // Do not change the response of this request, and proceed with the normal operation
        $isDataWidget = $request->getQueryParams()['component-data-widget'] ?? false;
        if ($isDataWidget) {
            return false;
        }

        // Else, check if the product is under maintenance
        // If this product is non in maintenance, then the request is eligible
        return !$this->isMaintenance();
    }

    /**
     * Retrieve the redirect ALS product
     *
     * @param $request RequestInterface
     * @return string
     */
    private function buildQueryParams(RequestInterface $request)
    {
        try {
            $product = str_replace('mobile-', '', $this->productResolver->getProduct() ?? 'sports-df');
            $queryParams = $request->getQueryParams() ?? [];
            $queryParams['redirect_product'] = $product;

            return http_build_query($queryParams);
        } catch (\Exception $e) {
            return $this->alsConfig['als_url'] ?? '';
        }
    }

    /**
     * @return bool
     */
    private function isMaintenance()
    {
        try {
            $productsUMConfig = explode("\r\n", $this->maintenanceConfig['product_list']);
            $product = $this->productResolver->getProduct();
            $dates = [
                'field_publish_date' => $this->maintenanceConfig["maintenance_publish_date_$product"] ?? '',
                'field_unpublish_date' => $this->maintenanceConfig["maintenance_unpublish_date_$product"] ?? '',
            ];

            return in_array($product, $productsUMConfig) && $this->isPublished($dates);
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * @param $data array
     * @return bool
     */
    private function isPublished($data)
    {
        if (empty($data['field_publish_date']) && empty($data['field_unpublish_date'])) {
            return false;
        } elseif ($data['field_unpublish_date']) {
            return $data['field_publish_date'] <= strtotime(date('m/d/Y H:i:s')) &&
                $data['field_unpublish_date'] >= strtotime(date('m/d/Y H:i:s'));
        } else {
            return $data['field_publish_date'] <= strtotime(date('m/d/Y H:i:s'));
        }
    }
}
