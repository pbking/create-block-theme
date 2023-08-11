import { __ } from '@wordpress/i18n';
import styles from './styles.module.css';
import {
	Button,
    // eslint-disable-next-line
	__experimentalInputControl as InputControl,
    RadioControl,
} from '@wordpress/components';
import { useState } from '@wordpress/element';
import { Fragment } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

export default function GitIntegrationAdminPage( { metadata } ) {
    const [view, setView] = useState('connections')

    const onChange = (action) => {
        if (['canceled', 'success'].includes(action)) {
            setView('connections')
        } else {
            setView('new-connection')
        }
    }

    return (
		<div className={ styles.pageLayout }>
			<div className={ styles.pageHeader }>
                <h1 className="wp-heading-inline">
                    { __( 'Create Block Theme: Git Utilities', 'create-block-theme' ) }
                </h1>
                <p>
                    { __(
                        'Connect your WordPress site themes with Git repositories. Pull theme changes from the connected repository and commit theme changes to the repository.',
                        'create-block-theme'
                    ) }
                    <br/>
                </p>
            </div>
			<div className={ styles.pageContainer }>
                {
                    view === 'new-connection' ? <div className={styles.repoForm}>
				        <GitConfigurationForm themeName={metadata.themeName} themeSlug={metadata.themeSlug} nonce={metadata.nonce} onChange={onChange} />
                    </div> : <div className={styles.connectedRepos}>
                        <ConnectedRepositories connected_repos={metadata.connected_repos} onChange={onChange} />
                    </div>
                }
			</div>
		</div>
	);
}

function GitConfigurationForm({themeName, themeSlug, nonce, onChange}) {
    const [config, setConfig] = useState({
        repositoryUrl: '',
        defaultBranch: '',
        connectionType: 'all-themes',
        themeSlug,
        accessToken: '',
        authorName: '',
        authorEmail: '',
    });

    const onSubmit = () => {
        apiFetch( {
			path: '/create-block-theme/v1/connect-git',
			method: 'POST',
			data: config,
			headers: {
				'Content-Type': 'application/json',
			},
		} )
        .then( (response) => {
            console.log({response})
            console.log({status: response.status});
            if (response.status !== 'success') {
                throw 'error'
            }
        } )
        .catch( ( error ) => {
            console.log({error});
        } );
    }

    return <div id="git-integration-form" className="theme-form">
        <h3>
            { __(
                'Connect a repository',
                'create-block-theme'
            ) }
        </h3>
        <input type="hidden" name="nonce" value={ nonce } />
        <InputControl
            label={ __('Repository Url', 'create-block-theme') }
            required
            value={ config.repositoryUrl }
            placeholder='https://github.com/username/repository.git'
            onChange={ (value) => setConfig({...config, repositoryUrl: value }) }
        />
        <br />
        <InputControl
            label={ __('Default Branch', 'create-block-theme') }
            required
            value={ config.defaultBranch }
            placeholder='main / master / trunk'
            onChange={ (value) => setConfig({...config, defaultBranch: value }) }
        />
        <br />
        <RadioControl
            selected={ config.connectionType }
            options={ [
                { label: __('Connect with all themes', 'create-block-theme'), value: 'all-themes' },
                { label: __( 'Connect with active theme', 'create-block-theme') + ` ${themeName}`, value: 'active-theme' },
            ] }
            onChange={ ( value ) => setConfig({
                ...config, connectionType: value
            }) }
        />
        <p>
            { __(
                'Following options are required if the repository is private or if you want to commit theme changes to the repository.',
                'create-block-theme'
            ) }
        </p>
        <InputControl
            label={ __('Access Token', 'create-block-theme') }
            required
            value={ config.accessToken }
            placeholder=''
            onChange={ (value) => setConfig({...config, accessToken: value }) }
        />
        <br />
        <InputControl
            label={ __('Author Name', 'create-block-theme') }
            required
            value={ config.authorName }
            onChange={ (value) => setConfig({...config, authorName: value }) }
        />
        <br />
        <InputControl
            label={ __('Author Email', 'create-block-theme') }
            required
            value={ config.authorEmail }
            onChange={ (value) => setConfig({...config, authorEmail: value }) }
        />
        <br />
        <div>
            <Button variant='primary' onClick={onSubmit}>Connect Repository</Button>
            <Button variant='secondary' onClick={() => onChange('canceled')} style={{marginLeft: '0.5rem'}}>Cancel</Button>
        </div>
    </div>
}

function ConnectedRepositories({connected_repos, onChange}) {
    return <div>
        <div className={styles.sectionHeader}>
            <h3>
                { __(
                    'Connected repositories',
                    'create-block-theme'
                ) }
            </h3>
            <Button variant='primary' onClick={() => onChange('new')}>
                { !connected_repos.length ? __('Connect a Repository', 'create-block-theme') : __('Connect Another Repository', 'create-block-theme') }
            </Button>
        </div>
        {
            !connected_repos.length ? <>
                <p>
                    { __(
                        'Site is not connected to any repository.',
                        'create-block-theme'
                    ) }
                </p>
            </> : 
            <>
                <div className={styles.repoTable}>
                    <div className={styles.connectedRepoHeader}></div>
                    <div className={styles.connectedRepoHeader}>Repository Url</div>
                    <div className={styles.connectedRepoHeader}>Default Branch</div>
                    <div className={styles.connectedRepoHeader}>Access Token</div>
                    <div className={styles.connectedRepoHeader}>Author</div>
                    <div className={styles.connectedRepoHeader}>Connected Theme</div>
                    {
                        connected_repos.map((repo, index) => <Fragment key={index}>
                            <div className={styles.connectedRepoItem}>{'Edit'}</div>
                            <div className={styles.connectedRepoItem}>{repo.repo_url}</div>
                            <div className={styles.connectedRepoItem}>{repo.default_branch}</div>
                            <div className={styles.connectedRepoItem}>{repo.access_token ? 'Set': 'Not set'}</div>
                            <div className={styles.connectedRepoItem}>{repo.author_name}</div>
                            <div className={styles.connectedRepoItem}>All Themes</div>
                        </Fragment>)
                    }
                </div>
            </>
        }
    </div>
}