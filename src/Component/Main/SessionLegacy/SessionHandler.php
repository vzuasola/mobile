<?php

namespace App\MobileEntry\Component\Main\SessionLegacy;

use App\Kernel;

class SessionHandler
{
    private $isSessionStared = false;

    /**
     * Public constructor.
     */
    public function __construct()
    {
        $container = Kernel::container();

        $this->domain = $container->get('settings')['session_handler']['cookie_domain'];
    }

    /**
     *
     */
    public function get($name)
    {
        $this->checkSessionState();

        return $_SESSION[$name] ?? null;
    }

    /**
     *
     */
    public function set($name, $value)
    {
        $this->checkSessionState();

        $_SESSION[$name] = $value;
    }

    /**
     *
     */
    public function delete($name)
    {
        $this->checkSessionState();

        unset($_SESSION[$name]);
    }

    /**
     *
     */
    private function checkSessionState()
    {
        if (!$this->isSessionStared) {
            session_start([
                'cookie_domain' => $this->domain,
            ]);

            $this->isSessionStared = true;
        }
    }
}
