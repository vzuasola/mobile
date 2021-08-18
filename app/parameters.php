<?php

// Site specific parameters

require APP_ROOT . '/core/app/parameters.php';

// Application Service
$parameters['appsvc.origin.dev'] = 'http://ms.appsvc.dev';
$parameters['appsvc.origin.tct'] = 'http://ctmt-cms-appsvc.games.de1';
$parameters['appsvc.origin.qa1'] = 'http://cms-ms.appsvc.dev';
$parameters['appsvc.origin.qa2'] = 'http://ctmt-cms-appsvc.games.de1';
$parameters['appsvc.origin.uat'] = 'http://ctmu-cms-ms.appsvc.stg';
$parameters['appsvc.origin.stg'] = 'http://cms-ms.appsvc.stg';
$parameters['appsvc.origin.prd'] = 'http://cms-ms-appsvc.games.twprd';
$parameters['appsvc.origin.its1'] = 'http://cms-appsvc.games.its1';
$parameters['appsvc.origin.itct'] = 'http://cms-appsvc.games.itct';
$parameters['appsvc.origin.istg'] = 'http://cms-appsvc.games.istg';
$parameters['appsvc.origin.iuat'] = 'http://cms-appsvc.games.iuat';

// Sunplus Service
$parameters['sunplus.vendor.id'] = 'cl62AmDS5oU';
$parameters['sunplus.server'] = '%env(SUNPLUS_AUTH_SERVER)%';
$parameters['env(SUNPLUS_AUTH_SERVER)'] = 'http://tsa.dafabet.com';
$parameters['sunplus.login.url'] = '/api/Login';
