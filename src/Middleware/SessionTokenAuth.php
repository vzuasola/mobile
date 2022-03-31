<?php

namespace App\MobileEntry\Middleware;

use App\Plugins\Middleware\RequestMiddlewareInterface;
use Interop\Container\ContainerInterface;
use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;
use App\Cookies\Cookies;
use App\MobileEntry\Middleware\ResponseCache;
use App\Utils\Host;

/**
 *
 */
class SessionTokenAuth implements RequestMiddlewareInterface
{
    /**
     *
     */
    protected $handler;

    /**
     *
     */
    protected $playerSession;

    /**
     *
     */
    protected $logger;

    /**
     *  Cookie Session Object Class
     */
    protected $cookieSession;

    /**
     * Constant variables
     */
    const ISSUER = 'webcomposer';
    const AUDIENCE = 'webcomposer';

    /**
     * Public constructor
     *
     * @param ContainerInterface $container
     */
    public function __construct(ContainerInterface $container)
    {
        $this->handler = $container->get('handler');
        $this->playerSession = $container->get('player_session');
        $this->logger = $container->get('logger');
        $this->jwt = $container->get('jwt_encryption');
    }

    /**
     *
     */
    public function boot(RequestInterface &$request)
    {

        try {
            $ctk = Cookies::get('ctk');
            $options = [
                'issuer' => self::ISSUER,
                'audience' => self::AUDIENCE,
            ];
            $cookie = $this->jwt->decrypt($ctk, $options);
            // don't run page cache if there's a cookie to be read
            if (!$this->playerSession->isLogin() && $cookie) {
                $request = $request->withAttribute(ResponseCache::CACHE_SKIP, true);
            }
        } catch (\Exception $e) {
            // do nothing
        }
    }

    /**
     *
     */
    public function handleRequest(RequestInterface &$request, ResponseInterface &$response)
    {
        $cookie = Cookies::get('ctk');

        if ($cookie && !empty($cookie) && !$this->playerSession->isLogin()) {
            try {
                $options = [
                    'issuer' => self::ISSUER,
                    'audience' => self::AUDIENCE,
                ];

                $result = $this->jwt->decrypt($cookie, $options);
                $this->playerSession->authenticateByToken($result['sessionToken']);
            } catch (\Exception $e) {
                $this->logger->info('Cookie Get for session failed - ' . $e->getMessage());
                // do nothing
            }
        } else {
            if ($this->playerSession->isLogin()) {
                try {
                    $params = [
                        'username' => $this->playerSession->getUsername(),
                        'playerId' => $this->playerSession->getDetails()['playerId'],
                        'sessionToken' => $this->playerSession->getToken(),
                    ];

                    $jwtOptions = [
                        'issuer' => self::ISSUER,
                        'audience' => self::AUDIENCE,
                        'expire_time' => time() + 86400,
                    ];

                    $options = [
                        'expire' => 0,
                        'path' => '/',
                        'domain' => Host::getDomain(),
                        'secure' => false,
                        'http' => false, // They need to read the cookie via javascript.
                    ];

                    $ctk = $this->jwt->encrypt($params, $jwtOptions);

                    Cookies::set('ctk', $ctk, $options);
                } catch (\Exception $e) {
                }
            }
        }
    }
}
