<?php

namespace App\MobileEntry\Module\PtplusTournament;

class PtplusTournamentController
{
    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('views_fetcher'),
            $container->get('rest'),
            $container->get('uri'),
            $container->get('player_session')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($views, $rest, $uri, $playerSession)
    {
        $this->views = $views;
        $this->rest = $rest;
        $this->uri = $uri;
        $this->playerSession = $playerSession;
    }
}
