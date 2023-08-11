<?php

class Create_Block_Theme_Settings {
	function get_settings() {
		return array(
			'connected_repos' => get_option('connected_repos', array())
        );
	}

	function update_settings( $settings ) {
        update_option( 'connected_repos', $settings );
	}

	function delete_settings() {
		delete_option( 'connected_repos' );
	}
}
