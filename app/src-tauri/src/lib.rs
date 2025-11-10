// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

use std::path::PathBuf;
use tauri::{WebviewUrl, WebviewWindowBuilder};
use tauri_plugin_store::StoreBuilder;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let app_handle = app.handle();
            let store_path = PathBuf::from("settings.json");
            let store = StoreBuilder::new(app_handle, store_path).build()?;

            let user_id = store.get("user_id");

            let page = if user_id.is_some() {
                "/src/home-page/home.html"
            } else {
                "/src/signup-page/signup.html"
            };

            // create and open window directly at the correct page
            WebviewWindowBuilder::new(app_handle, "main", WebviewUrl::App(page.into()))
                .title("privacypin")
                .inner_size(412.0, 715.0)
                .resizable(false)
                .build()?;

            Ok(())
        })
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
