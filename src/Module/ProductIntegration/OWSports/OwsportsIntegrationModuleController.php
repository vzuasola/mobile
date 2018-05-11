<?php

namespace App\MobileEntry\Module\ProductIntegration\OWSports;

class OwsportsIntegrationModuleController
{
    private $playerSession;
    private $config;
    private $rest;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session'),
            $container->get('config_fetcher'),
            $container->get('rest')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($playerSession, $config, $rest)
    {
        $this->playerSession = $playerSession;
        $this->config = $config;
        $this->rest = $rest;
    }

    public function integrate($request, $response)
    {
        $data = [];
        try {
            $isLogin = $this->playerSession->isLogin();
        } catch (\Exception $e) {
            $isLogin = false;
        }

        try {
            if ($isLogin) {
                $owsportsConfig = $this->config
                    ->getConfig('mobile_owsports.owsports_configuration');
                $host = $request->getHeader('host')[0] ?? '';
                $userAgent = $request->getHeader('user-agent')[0] ?? '';
                $agentsList = $owsportsConfig['iwap_agents'] ?? '';
                $ismart = $owsportsConfig['smart_wap'] ?? '';
                $iwap = $owsportsConfig['iwap'] ?? '';
                $owParams = $owsportsConfig['owsports_param'] ?? '';
                $data['lobby_url'] = $this->owsports($host, $agentsList, $userAgent, $ismart, $iwap, $owParams);
            }
        } catch (\Exception $e) {
            $data['lobby_url'] = '';
        }
        return $this->rest->output($response, $data);
    }

    private function owsports($host, $agentsList, $userAgent, $ismart, $iwap, $urlParams)
    {
        $mobileAgents = $this->createAgentfromList($agentsList);

        // Retrieve the Top-level domain of a 3 or more level domain (e.g. www.domain.com)
        $tld = substr($host, stripos($host, '.')+1);
        $integrationUrl = $ismart ?? 'http://ismart.' . $tld . '/Deposit_ProcessLogin.aspx';

        // Check user agents
        if (preg_match($mobileAgents, $userAgent)) {
            $integrationUrl = $iwap ?? 'http://iwap.' . $tld . '/Deposit_ProcessLogin.aspx';
        }
        return $integrationUrl . $urlParams;
    }

    private function createAgentfromList($agentsList)
    {
        $agents = explode("\r\n", $agentsList);
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
