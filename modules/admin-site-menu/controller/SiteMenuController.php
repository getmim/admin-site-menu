<?php
/**
 * SiteMenuController
 * @package admin-site-menu
 * @version 0.0.1
 */

namespace AdminSiteMenu\Controller;

use LibFormatter\Library\Formatter;
use LibForm\Library\Form;
use SiteMenu\Model\SiteMenu as SMenu;

class SiteMenuController extends \Admin\Controller
{

    public function indexAction() {
        if(!$this->user->isLogin())
            return $this->loginFirst(1);
        if(!$this->can_i->manage_site_menu)
            return $this->show404();

        $menus = SMenu::get([], 0, 1, ['name'=>'ASC']);
        if($menus)
            $menus = Formatter::formatMany('site-menu', $menus, ['user']);
        
        $params = [
            '_meta' => [
                'title' => 'System Settings',
                'menus' => ['admin-setting']
            ],
            'menus' => $menus,
            'saved' => $this->req->getQuery('saved')
        ];

        return $this->resp('site-menu/index', $params);
    }

    public function editAction() {
        if(!$this->user->isLogin())
            return $this->loginFirst(1);
        if(!$this->can_i->manage_site_menu)
            return $this->show404();

        $id = $this->req->param->id;
        if(!$id)
            return $this->show404();

        $menu = SMenu::getOne(['id'=>$id]);
        if(!$menu)
            return $this->show404();

        $o_menus = SMenu::get([], 0, 1, ['name'=>true]);
        if($o_menus)
            $o_menus = Formatter::formatMany('site-menu', $o_menus, ['user']);

        $form = new Form('site-menu.create');

        $params = [
            '_meta' => [
                'title' => 'System Settings',
                'menus' => ['admin-setting']
            ],
            'form'  => $form,
            'b_title' => hs( $id ? $menu->name : 'Create new' ),
            'o_menus' => $o_menus,
            'editor' => new Form('site-menu-item.editor')
        ];

        if(!($valid = $form->validate($menu)) || !$form->csrfTest('noob'))
            return $this->resp('site-menu/edit', $params);

        if(!SMenu::set((array)$valid, ['id'=>$id]))
            deb(SMenu::lastError());
        
        // add the log
        $this->addLog([
            'user'   => $this->user->id,
            'object' => $id,
            'parent' => 0,
            'method' => 2,
            'type'   => 'site_menu',
            'original' => $menu,
            'changes'  => $valid
        ]);

        $next = $this->router->to('adminSiteMenuIndex', [], ['saved'=>$id]);
        $this->res->redirect($next);
    }
}