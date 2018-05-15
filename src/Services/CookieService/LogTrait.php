<?php

namespace App\MobileEntry\Services\CookieService;

/**
 * Trait for logging cookie service
 */
trait LogTrait
{
    /**
     * Log success requirements
     *
     * - Log the username and sessionToken sent in the request.
     */
    protected function logInfo($title, $uri, $postData, $body)
    {
        $this->logger->info('AppSvc ' . $title, [
            'component' => static::class,
            'source' => $uri,
            'username' => $postData['username'] ?? '',
            'sessionToken' => $postData['sessionToken'] ?? '',
            'action' => 'Guzzle client request object',
            'object' => '',
            'status' => 'Successful request',
            'response' => $body,
        ]);
    }

    /**
     * Log error requirements
     *
     * - Log the complete URL including query string.
     * - In the case of a request in which values are sent in the body,
     *   you must include the body in the log. The body should include all
     *   the parameters sent in the request: playerId, sessionToken, username.
     */
    protected function logException($title, $uri, $postData, $e)
    {
        $this->logger->error('AppSvc ' . $title, [
            'component' => static::class,
            'source' => $uri,
            'requestBody' => $postData,
            'action' => '',
            'object' => '',
            'status' => 'Failed request',
            'response' => $e->getCode(),
            'exception' => $e->getMessage(),
        ]);
    }
}
