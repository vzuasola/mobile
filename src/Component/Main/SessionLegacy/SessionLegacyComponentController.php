<?php

namespace App\MobileEntry\Component\Main\SessionLegacy;

class SessionLegacyComponentController
{
    private $session;
    private $rest;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            new SessionHandler(),
            $container->get('rest')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($session, $rest)
    {
        $this->session = $session;
        $this->rest = $rest;
    }

    /**
     *
     */
    public function init($request, $response)
    {
        $this->session->set('session.test', microtime(true));

        $data['status'] = true;

        return $this->rest->output($response, $data);
    }

    /**
     *
     */
    public function process($request, $response)
    {
        $data['time'] = $this->session->get('session.test');
        sleep(1);

        $data['status'] = true;

        return $this->rest->output($response, $data);
    }

    /**
     *
     */
    public function delete($request, $response)
    {
        $this->session->remove('session.test');

        $data['status'] = true;

        return $this->rest->output($response, $data);
    }
}
