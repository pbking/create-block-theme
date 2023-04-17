<?php

class Theme_Variations {

    public static function register_endpoints() {

		register_rest_route(
			'create-block-theme/v1',
			'/theme-variations',
			array(
				'methods'             => 'GET',
				'callback'            => array( 'Theme_Variations', 'get_variations' ),
				'permission_callback' => function () {
					return true; //current_user_can( 'edit_theme_options' );
				},
			)
		);

        register_rest_route(
			'create-block-theme/v1',
			'/theme-variations',
			array(
				'methods'             => 'DELETE',
                'args'                => array(
					'file' => array(
                        'required' => true,
                        'type'     => 'string',
                        'description' => 'The filename of the variation to delete',
                    ),
				),
				'callback'            => array( 'Theme_Variations', 'delete_variation' ),
				'permission_callback' => function () {
					return true; //current_user_can( 'edit_theme_options' );
				},
			)
		);

	}

    static function recursively_iterate_json( $dir ) {
		$nested_files      = new RecursiveIteratorIterator( new RecursiveDirectoryIterator( $dir ) );
		$nested_json_files = iterator_to_array( new RegexIterator( $nested_files, '/^.+\.json$/i', RecursiveRegexIterator::GET_MATCH ) );
		return $nested_json_files;
	}

    static function get_theme_variations () {
        // Get the variation from the theme directory
        // This is different to the Gutenberg function:
        // If a child theme is activated it gets only the child theme variations and not the parent theme variations
        $base_directory     = get_stylesheet_directory() . '/styles';
		$variations = array();

		if ( is_dir( $base_directory ) ) {
			$variation_files = static::recursively_iterate_json( $base_directory );
			foreach ( $variation_files as $path => $file ) {
				$decoded_file = wp_json_file_decode( $path, array( 'associative' => true ) );
				$variations[] = array(
					'file' =>  basename( $path ),
					'title' => $decoded_file['title'] ?? basename( $path ),
				);
		    }
        }
        return $variations;
    }

    static function get_variations() {
		$variations = Theme_Variations::get_theme_variations();
		return rest_ensure_response( $variations );
	}

    static function delete_variation ( $data ) {
        $file =  $data['file'];
        $directory = get_stylesheet_directory() . '/styles/';
        $path = wp_normalize_path( $directory ) . $file;

        if ( file_exists ( $path ) ) {
            wp_delete_file( $path );
            if ( file_exists( $path ) ) {
                // If the file exists after trying to delete it there was a problem
                // We need to check this because wp_delete_file always returns NULL
                return new WP_Error( 'file_not_deleted ', __( 'Variation file not deleted this is likely a file permissions problem', 'create-block-theme' ), array( 'status' => 403 ) );
            }
        } else {
            return new WP_Error( 'file_not_found ', __( 'Variation file not found', 'create-block-theme' ), array( 'status' => 404 ) );
        }
        
        // If the variation was deleted successfully return the new list of variations
        $variations = Theme_Variations::get_theme_variations();
		return $variations;
    }

    static function update_variation ( $variation ) {
        $files = array();
    }

}




?>