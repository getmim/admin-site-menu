<?php

return [
    '__name' => 'admin-site-menu',
    '__version' => '0.1.0',
    '__git' => 'git@github.com:getmim/admin-site-menu.git',
    '__license' => 'MIT',
    '__author' => [
        'name' => 'Iqbal Fauzi',
        'email' => 'iqbalfawz@gmail.com',
        'website' => 'http://iqbalfn.com/'
    ],
    '__files' => [
        'modules/admin-site-menu' => ['install','update','remove'],
        'theme/admin/site-menu' => ['install','update','remove'],
        'theme/admin/form/field/site-menu.phtml' => ['install','update','remove'],
        'theme/admin/static/css/site-menu.min.css' => ['install','update','remove'],
        'theme/admin/static/css/site-menu.min.css.map' => ['install','update','remove'],
        'theme/admin/static/js/site-menu.min.js' => ['install','update','remove'],
        'theme/admin/static/js/site-menu.min.js.map' => ['install','update','remove'],
    ],
    '__dependencies' => [
        'required' => [
            [
                'admin' => NULL
            ],
            [
                'site-menu' => NULL
            ],
            [
                'admin-setting' => NULL
            ],
            [
                'lib-form' => NULL
            ],
            [
                'lib-event' => NULL
            ]
        ],
        'optional' => []
    ],
    'autoload' => [
        'classes' => [
            'AdminSiteMenu\\Controller' => [
                'type' => 'file',
                'base' => 'modules/admin-site-menu/controller'
            ]
        ],
        'files' => []
    ],
    'routes' => [
        'admin' => [
            'adminSiteMenuIndex' => [
                'path' => [
                    'value' => '/site-menu'
                ],
                'handler' => 'AdminSiteMenu\\Controller\\SiteMenu::index'
            ],
            'adminSiteMenuEdit' => [
                'path' => [
                    'value' => '/site-menu/(:id)'
                ],
                'method' => 'GET|POST',
                'handler' => 'AdminSiteMenu\\Controller\\SiteMenu::edit'
            ]
        ]
    ],
    'adminSetting' => [
        'menus' => [
            'admin-site-menu' => [
                'label' => 'Site Menu',
                'icon' => '<i class="fas fa-bars"></i>',
                'info' => 'Create or modify site menus',
                'perm' => 'manage_site_menu',
                'index' => 1000,
                'options' => [
                    'admin-site-menu' => [
                        'label' => 'Change settings',
                        'route' => ['adminSiteMenuIndex']
                    ]
                ]
            ]
        ]
    ],
    'libForm' => [
        'forms' => [
            'site-menu-item.editor' => [
                'label' => [
                    'type' => 'text',
                    'label' => 'Label',
                    'rules' => [
                        'required' => true,
                        'empty' => false 
                    ]
                ],
                'link' => [
                    'type' => 'text',
                    'label' => 'Link',
                    'rules' => [
                        'required' => true,
                        'empty' => false
                    ]
                ]
            ],
            'site-menu.create' => [
                'content' => [
                    'type' => 'site-menu',
                    'label' => 'Content',
                    'nolabel' => true,
                    'rules' => [
                        'required' => true,
                        'empty' => false,
                        'json' => true
                    ]
                ]
            ]
        ]
    ]
];