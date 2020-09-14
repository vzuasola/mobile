<?php

namespace App\MobileEntry\Module\ProductIntegration\OWSports;

use App\MobileEntry\Services\Product\Products;

class OWSportsIntegrationModuleController
{
    private $playerSession;
    private $config;
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
            $container->get('rest'),
            $container->get('token_parser')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($playerSession, $config, $rest, $parser)
    {
        $this->playerSession = $playerSession;
        $this->config = $config;
        $this->rest = $rest;
        $this->parser = $parser;
    }

    /**
     *
     */
    public function integrate($request, $response)
    {
        $data = [];
        $host = $request->getHeader('host')[0] ?? '';

        try {
            $isLogin = $this->playerSession->isLogin();
            $owsportsConfig = $this->config->getConfig('mobile_owsports.owsports_configuration');
        } catch (\Exception $e) {
            $isLogin = false;
            $owsportsConfig = [];
        }

        try {
            $maintenanceConfigs = $this->config->getConfig('webcomposer_config.webcomposer_site_maintenance');
        } catch (\Exception $e) {
            $maintenanceConfigs = [];
        }

        if ($isLogin) {
            $userAgent = $request->getHeader('user-agent')[0] ?? '';

            $agentsList = $owsportsConfig['iwap_agents'] ?? '';
            $ismart = $owsportsConfig['smart_wap'] ?? '';
            $iwap = $owsportsConfig['iwap'] ?? '';
            $owParams = $owsportsConfig['owsports_param'] ?? '';
            $isEncoded = $owsportsConfig['owsports_param_encode'] ?? true;

            $data['redirect'] = $this->getOwsportsLink(
                $host,
                $agentsList,
                $userAgent,
                $ismart,
                $iwap,
                $owParams,
                $isEncoded
            );
        } else {
            $owParams = $owsportsConfig['owsports_prelogin_param'] ?? '';
            $ismartPrelogin = $owsportsConfig['smart_wap_prelogin'] ?? '';
            $isEncoded = $owsportsConfig['owsports_prelogin_param_encode'] ?? true;
            $data['redirect'] = $this->getPreLoginLink($host, $owParams, $ismartPrelogin, $isEncoded);
        }

        $this->maintenance($request, $data);

        $matrix = $this->playerSession->getDetails()['isPlayerCreatedByAgent'] ?? false;
        if ($matrix) {
            unset($data['redirect']);
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
            $productCode = $this->getProductFromRequest($request) ?? 'sports';
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
        $findProduct = $request->getParsedBody()['product'] ?? $params['product'] ?? false;
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
     * Return iwap / ismart url
     *
     * @param string $host
     * @param string $agentsList
     * @param string $userAgent
     * @param string $ismart
     * @param string $iwap
     * @param string $urlParams
     *
     * @return string
     */
    private function getOwsportsLink($host, $agentsList, $userAgent, $ismart, $iwap, $urlParams, $isEncoded)
    {
        $mobileAgents = $this->createAgentfromList($agentsList);

        // Retrieve the Top-level domain of a 3 or more level domain (e.g. www.domain.com)
        $tld = substr($host, stripos($host, '.') + 1);
        $integrationUrl = $ismart ?? "http://ismart.$tld/Deposit_ProcessLogin.aspx";

        // Check user agents
        if (preg_match($mobileAgents, $userAgent)) {
            $integrationUrl = $iwap ?? "http://iwap.$tld/Deposit_ProcessLogin.aspx";
        }

        return $integrationUrl . '?' . $this->encodeUrlParams($urlParams, $isEncoded);
    }

    /**
     * Return ismart pre login url
     *
     * @param string $host
     * @param string $urlParams
     *
     * @return string
     */
    private function getPreLoginLink($host, $urlParams, $ismartPrelogin, $isEncoded)
    {

        // Retrieve the Top-level domain of a 3 or more level domain (e.g. www.domain.com)
        $tld = substr($host, stripos($host, '.') + 1);
        $integrationUrl = $ismartPrelogin ?? "http://ismart.$tld/DepositLogin/bfindex";

        return $integrationUrl .'?' . $this->encodeUrlParams($urlParams, $isEncoded);
    }

    /**
     * Return urlencoded query parameters
     *
     * @param string $params
     *
     * @return string
     */
    private function encodeUrlParams($params, $isEncoded)
    {
        $queryStr = '';
        $encodedUrlParams = [];
        $urlParams = explode("\r\n", $params);
        if ($urlParams) {
            foreach ($urlParams as $urlParam) {
                $queryStr = explode("|", $urlParam);
                if (isset($queryStr[0]) && isset($queryStr[1])) {
                    $encodedUrlParams[$queryStr[0]] =
                        $this->parser->processTokens($queryStr[1]);
                }
            }

            $queryStr = http_build_query($encodedUrlParams, '&');
            if (!$isEncoded) {
                $queryStr = urldecode($queryStr);
            }
        }

        return $queryStr;
    }

    /**
     *
     */
    private function createAgentfromList($agentsList)
    {
        $agents = explode(PHP_EOL, $agentsList);
        $trimmedAgents = array_map('trim', $agents);
        end($trimmedAgents);
        $lastKey = key($trimmedAgents);

        if ($agentsList) {
            $mobileAgents = '!(';

            foreach ($trimmedAgents as $key => $value) {
                $mobileAgents .= rtrim($value, ' ');

                if ($key != $lastKey) {
                    $mobileAgents .= '|';
                }
            }

            $mobileAgents .= ')!i';
        } else {
            $mobileAgents = '!(windows|blackberry|symbian|symbianOS)!i';
        }

        return $mobileAgents;
    }
}
