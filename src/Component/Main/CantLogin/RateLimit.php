<?php

namespace App\MobileEntry\Component\Main\CantLogin;

use RateLimit\Exception\LimitExceeded;
use RateLimit\Rate;
use RateLimit\PredisRateLimiter;
use Predis\Client;
use App\Utils\IP;

class RateLimit
{
    /**
     * 
     */
    private $settings;

     /**
     * Container resolver
     */
    public static function create($container)
    {
        return new static(
            $container->get('settings')
        );
    }

    /**
     *
     */
    public function __construct($settings)
    {
        $this->settings = $settings;
    }

    /**
     * Get Predis Client
     *
     */
    private function getClient()
    {
        $sessionHandler = $this->settings->get('session_handler');
        return new Client(
            $sessionHandler['handler_options']['clients'],
            $sessionHandler['handler_options']['options']
        );
    }

    /**
     * 
     */
    public function checkLimit($key, $operation = 1, $interval = 60)
    {
        $client = $this->getClient();
        $rateLimiter = new PredisRateLimiter($client, $key);

        $status = $rateLimiter->limitSilently(IP::getIpAddress(), Rate::custom($operation, $interval));

        return $status->limitExceeded();
    }
}
