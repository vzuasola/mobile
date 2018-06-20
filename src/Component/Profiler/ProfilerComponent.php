<?php

namespace App\MobileEntry\Component\Profiler;

use App\Kernel;
use App\Plugins\ComponentWidget\ComponentWidgetInterface;

use App\MobileEntry\Middleware\ResponseCache;

class ProfilerComponent implements ComponentWidgetInterface
{
    /**
     *
     */
    public function getTemplate()
    {
        return '@component/Profiler/template.html.twig';
    }

    /**
     *
     */
    public function getData($options = [])
    {
        $stack = [];

        $response = $options['response'];

        $cacheState = $response->getHeaderLine(ResponseCache::CACHE_HEADER);

        if ($cacheState === ResponseCache::CACHE_HIT) {
            $data['cache'] = true;
        }

        $this->populateMiddlewares($stack);
        $this->populateNetwork($stack);

        $data['stack'] = $stack;

        return $data;
    }

    private function populateMiddlewares(&$stack)
    {
        $middlewares = Kernel::container()->get('middleware_manager');

        $requests = $middlewares->getRequestMiddlewares();
        $responses = $middlewares->getResponseMiddlewares();
        $caches = $middlewares->getCacheMiddlewares();

        $stack['Middlewares']['Request Middlewares'] = array_values($requests);
        $stack['Middlewares']['Response Middlewares'] = array_values($responses);
        $stack['Middlewares']['Cache Middlewares'] = array_values($caches);
    }

    private function populateNetwork(&$stack)
    {
        $requests = Kernel::container()->get('client_stats');
        $stats = $requests->getStack();

        foreach ($stats as $value) {
            $stat = $value['stats'];

            $request = $stat->getRequest();

            $uri = (string) $request->getUri();

            $time = number_format($stat->getTransferTime() * 1000, 3, ".", "");
            $time = str_pad($time, 7, 0, STR_PAD_LEFT);

            $path = "$time ms  -  $uri";

            $stash = [
                'message' => $path,
                'trace' => $value['trace'] ?? false,
            ];

            if (strpos($uri, '/api/v1/integration/')) {
                $stack['Network']['Integration'][] = $stash;
            } elseif (strpos($uri, '/api/v1/drupal/')) {
                $stack['Network']['Drupal'][] = $stash;
            } else {
                $stack['Network']['Generic'][] = $stash;
            }
        }
    }
}
