<?php

namespace App\MobileEntry\Module\ProductIntegration\ALS;

use App\Drupal\Config;
use App\Cookies\Cookies;
use App\MobileEntry\Services\Product\Products;
use App\MobileEntry\Tools\DsbCookieHelper;
use App\Utils\Host;

class ALSIntegrationModuleController
{
    private $playerSession;
    private $config;
    private $cookieService;
    private $rest;
    private $parser;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session'),
            $container->get('config_fetcher'),
            $container->get('cookie_service'),
            $container->get('rest'),
            $container->get('token_parser')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($playerSession, $config, $cookieService, $rest, $parser)
    {
        $this->playerSession = $playerSession;
        $this->config = $config;
        $this->cookieService = $cookieService;
        $this->rest = $rest;
        $this->parser = $parser;
    }

    /**
     *
     */
    public function integrate($request, $response)
    {
        try {
            $alsConfig = $this->config->getConfig('mobile_als.als_configuration');
        } catch (\Exception $e) {
            $alsConfig = [];
        }

        $enableDomain = $alsConfig['als_enable_domain'] ?? false;
        $url = $alsConfig['als_url'] ?? '';
        $this->generateLobby($url, $enableDomain);

        Cookies::remove('X_DEVICE_VIEW', [
            'path' => '/'
        ]);

        $dsbCookieHelper = new DsbCookieHelper($this->parser, $this->playerSession, $alsConfig);
        $dsbCookieHelper->setDafaUrlCookies();

        $postData = $request->getParsedBody();
        $language = $postData['language'] ?? 'en';

        $data['redirect']  = $this->playerMatrixLobby($url, $language);
        $this->maintenance($request, $data);

        // If with query params redirect_product, this means that the referer is from middleware
        if ($request->getQueryParams()['redirect_product'] ?? false) {
            $response = $response->withRedirect($this->parser->processTokens($data['redirect']));
        }

        return $this->rest->output($response, $data);
    }

    private function maintenance($request, &$data)
    {
        try {
            $maintenanceConfigs = $this->config->getConfig('webcomposer_config.webcomposer_site_maintenance');
        } catch (\Exception $e) {
            $maintenanceConfigs = [];
        }

        try {
            $productsUMConfig = explode("\r\n", $maintenanceConfigs['product_list']);
            $language = $request->getParsedBody()['language'] ?? 'en';
            $productCode = $this->getProductFromRequest($request) ?? 'sports-df';
            $product = Products::PRODUCTCODE_MAPPING[$productCode];
            parse_str(parse_url($request->getHeader('referer')[0] ?? '')['query'] ?? "", $params);

            $dates = [
                'field_publish_date' => $maintenanceConfigs["maintenance_publish_date_$product"] ?? '',
                'field_unpublish_date' => $maintenanceConfigs["maintenance_unpublish_date_$product"] ?? '',
            ];

            if (in_array($product, $productsUMConfig) && $this->isPublished($dates)) {
                $path =  $params['product'] ?? $productCode;
                $data['redirect'] = "/$language/". $path;
            }
        } catch (\Exception $e) {
            //placeholder
        }
    }

    private function getProductFromRequest($request)
    {
        parse_str(parse_url($request->getHeader('referer')[0] ?? '')['query'] ?? "", $params);
        $findProduct = $request->getParsedBody()['product']
            ?? $request->getQueryParams()['redirect_product']
            ?? $params['product'] ?? false;
        if (!$findProduct) {
            return;
        }
        $productAliases = Products::PRODUCT_ALIAS;
        foreach ($productAliases as $product => $productAlias) {
            if (in_array(strtolower($findProduct), $productAlias)) {
                return $product;
            }
        }
    }

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

    /**
     * Function to generate ALS domain base on the site domain
     */
    private function generateLobby(&$url, $enableDomain)
    {
        if ($enableDomain) {
            $domain = Host::getDomainFromUri($url);
            $hostname = Host::getDomain();

            if ($domain !== $hostname) {
                $url = str_replace($domain, $hostname, $url);
            }
        }
    }

    /**
     * Update the language to EN if language is ES/PT and is created by agent
     *
     * @param string $url
     * @param string $lang
     * @return string
     */
    private function playerMatrixLobby($url, $lang)
    {
        $matrix = $this->playerSession->getDetails()['isPlayerCreatedByAgent'] ?? false;
        if ($matrix &&
            in_array($lang, ['es', 'pt'])
        ) {
            $url = str_replace('/m/' . $lang, '/m/en', $url);
        }

        return $url;
    }
}
