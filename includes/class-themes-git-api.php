<?php

require_once( __DIR__ . '/class-create-block-theme-settings.php' );

class Themes_Git_API {
    private $connection_types = array(
        "ALL_THEMES" => 'all-themes',
        "CURRENT_THEME" => 'active-theme'
    );

    public $plugin_settings;

	public function __construct() {
		$this->plugin_settings = new Create_Block_Theme_Settings();
	}

    public function connect_git_repo($request) {
        $repository = $request->get_params();

        try {
            // $this->plugin_settings-> update_settings($repository);

            return array("status" => "success", "repo" => $repository);
        } catch (\Throwable $th) {
            return array("status" => "failed");
        }
    }
}
