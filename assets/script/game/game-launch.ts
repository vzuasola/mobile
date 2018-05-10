export interface GameLaunch {
    /**
     * List of supported events
     */
    events: {} = {};

    /**
     * A custom init method that will be called on document ready
     */
    init();

    /**
     * Authenticate using username and password
     *
     * @param string username
     * @param string password
     *
     * @return boolean|Promise
     */
    login(username: string, password: string);

    /**
     * Method invoked before launching a game
     *
     * @param array options
     */
    prelaunch(options: {[name: string]: string});

    /**
     * Launch a game
     *
     * @param array options
     *
     * @return boolean
     */
    launch(options: {[name: string]: string});

    /**
     * Invoked when a player is logout
     *
     * @param array options
     *
     * @return boolean
     */
    logout();
}
