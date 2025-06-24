
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * Environment variables [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env`. Like [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), this module cannot be imported into client-side code. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * _Unlike_ [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), the values exported from this module are statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * ```ts
 * import { API_KEY } from '$env/static/private';
 * ```
 * 
 * Note that all environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * 
 * ```
 * MY_FEATURE_FLAG=""
 * ```
 * 
 * You can override `.env` values from the command line like so:
 * 
 * ```bash
 * MY_FEATURE_FLAG="enabled" npm run dev
 * ```
 */
declare module '$env/static/private' {
	export const SHELL: string;
	export const npm_command: string;
	export const SESSION_MANAGER: string;
	export const NVM_INC: string;
	export const HISTCONTROL: string;
	export const XDG_MENU_PREFIX: string;
	export const TERMINAL_EMULATOR: string;
	export const HISTSIZE: string;
	export const HOSTNAME: string;
	export const NODE: string;
	export const TAURI_ENV_DEBUG: string;
	export const PROCESS_LAUNCHED_BY_Q: string;
	export const SSH_AUTH_SOCK: string;
	export const MEMORY_PRESSURE_WRITE: string;
	export const TERM_SESSION_ID: string;
	export const npm_config_local_prefix: string;
	export const XMODIFIERS: string;
	export const DESKTOP_SESSION: string;
	export const GPG_TTY: string;
	export const EDITOR: string;
	export const MACOSX_DEPLOYMENT_TARGET: string;
	export const PWD: string;
	export const LOGNAME: string;
	export const XDG_SESSION_DESKTOP: string;
	export const TAURI_ENV_PLATFORM: string;
	export const XDG_SESSION_TYPE: string;
	export const PROCESS_LAUNCHED_BY_CW: string;
	export const SYSTEMD_EXEC_PID: string;
	export const _: string;
	export const XAUTHORITY: string;
	export const DESKTOP_STARTUP_ID: string;
	export const GJS_DEBUG_TOPICS: string;
	export const GDM_LANG: string;
	export const HOME: string;
	export const USERNAME: string;
	export const SSH_ASKPASS: string;
	export const LANG: string;
	export const LS_COLORS: string;
	export const XDG_CURRENT_DESKTOP: string;
	export const npm_package_version: string;
	export const MEMORY_PRESSURE_WATCH: string;
	export const WAYLAND_DISPLAY: string;
	export const INVOCATION_ID: string;
	export const FIG_TERM: string;
	export const MANAGERPID: string;
	export const npm_lifecycle_script: string;
	export const GJS_DEBUG_OUTPUT: string;
	export const MOZ_GMP_PATH: string;
	export const NVM_DIR: string;
	export const GNOME_SETUP_DISPLAY: string;
	export const TAURI_ENV_PLATFORM_VERSION: string;
	export const XDG_ACTIVATION_TOKEN: string;
	export const XDG_SESSION_CLASS: string;
	export const TAURI_ENV_FAMILY: string;
	export const TERM: string;
	export const npm_package_name: string;
	export const LESSOPEN: string;
	export const USER: string;
	export const TAURI_ENV_TARGET_TRIPLE: string;
	export const DISPLAY: string;
	export const npm_lifecycle_event: string;
	export const SHLVL: string;
	export const NVM_CD_FLAGS: string;
	export const QT_IM_MODULE: string;
	export const TAURI_CLI_VERBOSITY: string;
	export const INTELLIJ_TERMINAL_COMMAND_BLOCKS_REWORKED: string;
	export const npm_config_user_agent: string;
	export const npm_execpath: string;
	export const XDG_RUNTIME_DIR: string;
	export const DEBUGINFOD_URLS: string;
	export const npm_package_json: string;
	export const BUN_INSTALL: string;
	export const DEBUGINFOD_IMA_CERT_PATH: string;
	export const TAURI_ENV_ARCH: string;
	export const KDEDIRS: string;
	export const JOURNAL_STREAM: string;
	export const XDG_DATA_DIRS: string;
	export const PATH: string;
	export const GDMSESSION: string;
	export const DBUS_SESSION_BUS_ADDRESS: string;
	export const MAIL: string;
	export const NVM_BIN: string;
	export const GIO_LAUNCHED_DESKTOP_FILE_PID: string;
	export const npm_node_execpath: string;
	export const GIO_LAUNCHED_DESKTOP_FILE: string;
	export const NODE_ENV: string;
}

/**
 * Similar to [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private), except that it only includes environment variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Values are replaced statically at build time.
 * 
 * ```ts
 * import { PUBLIC_BASE_URL } from '$env/static/public';
 * ```
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to runtime environment variables, as defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * This module cannot be imported into client-side code.
 * 
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * console.log(env.DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 * 
 * > In `dev`, `$env/dynamic` always includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 */
declare module '$env/dynamic/private' {
	export const env: {
		SHELL: string;
		npm_command: string;
		SESSION_MANAGER: string;
		NVM_INC: string;
		HISTCONTROL: string;
		XDG_MENU_PREFIX: string;
		TERMINAL_EMULATOR: string;
		HISTSIZE: string;
		HOSTNAME: string;
		NODE: string;
		TAURI_ENV_DEBUG: string;
		PROCESS_LAUNCHED_BY_Q: string;
		SSH_AUTH_SOCK: string;
		MEMORY_PRESSURE_WRITE: string;
		TERM_SESSION_ID: string;
		npm_config_local_prefix: string;
		XMODIFIERS: string;
		DESKTOP_SESSION: string;
		GPG_TTY: string;
		EDITOR: string;
		MACOSX_DEPLOYMENT_TARGET: string;
		PWD: string;
		LOGNAME: string;
		XDG_SESSION_DESKTOP: string;
		TAURI_ENV_PLATFORM: string;
		XDG_SESSION_TYPE: string;
		PROCESS_LAUNCHED_BY_CW: string;
		SYSTEMD_EXEC_PID: string;
		_: string;
		XAUTHORITY: string;
		DESKTOP_STARTUP_ID: string;
		GJS_DEBUG_TOPICS: string;
		GDM_LANG: string;
		HOME: string;
		USERNAME: string;
		SSH_ASKPASS: string;
		LANG: string;
		LS_COLORS: string;
		XDG_CURRENT_DESKTOP: string;
		npm_package_version: string;
		MEMORY_PRESSURE_WATCH: string;
		WAYLAND_DISPLAY: string;
		INVOCATION_ID: string;
		FIG_TERM: string;
		MANAGERPID: string;
		npm_lifecycle_script: string;
		GJS_DEBUG_OUTPUT: string;
		MOZ_GMP_PATH: string;
		NVM_DIR: string;
		GNOME_SETUP_DISPLAY: string;
		TAURI_ENV_PLATFORM_VERSION: string;
		XDG_ACTIVATION_TOKEN: string;
		XDG_SESSION_CLASS: string;
		TAURI_ENV_FAMILY: string;
		TERM: string;
		npm_package_name: string;
		LESSOPEN: string;
		USER: string;
		TAURI_ENV_TARGET_TRIPLE: string;
		DISPLAY: string;
		npm_lifecycle_event: string;
		SHLVL: string;
		NVM_CD_FLAGS: string;
		QT_IM_MODULE: string;
		TAURI_CLI_VERBOSITY: string;
		INTELLIJ_TERMINAL_COMMAND_BLOCKS_REWORKED: string;
		npm_config_user_agent: string;
		npm_execpath: string;
		XDG_RUNTIME_DIR: string;
		DEBUGINFOD_URLS: string;
		npm_package_json: string;
		BUN_INSTALL: string;
		DEBUGINFOD_IMA_CERT_PATH: string;
		TAURI_ENV_ARCH: string;
		KDEDIRS: string;
		JOURNAL_STREAM: string;
		XDG_DATA_DIRS: string;
		PATH: string;
		GDMSESSION: string;
		DBUS_SESSION_BUS_ADDRESS: string;
		MAIL: string;
		NVM_BIN: string;
		GIO_LAUNCHED_DESKTOP_FILE_PID: string;
		npm_node_execpath: string;
		GIO_LAUNCHED_DESKTOP_FILE: string;
		NODE_ENV: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * Similar to [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), but only includes variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Note that public dynamic environment variables must all be sent from the server to the client, causing larger network requests — when possible, use `$env/static/public` instead.
 * 
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
