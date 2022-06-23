# DebugNotes for Rider and ReSharper

## 1. Run plugin locally
To run the plugin locally:
- Launch the Webpack webserver (see front part)
- Run the `Rider` launch configuration (or run `build.gradle/runIde` task, this is the same)
When launching locally, the webview is served from the Webpack web server

## 2. Build and publish the plugin 
To create and publish a new version of the plugin:
- Update the version in `gradle.properties`
- Choose the channel in `build.gradle/publishPlugin`
- Make sure `token` is set
- Launch the task `publishPlugin` from `build.gradle`. This will:
  - Build the front part of the plugin (`buildWebview`) and copy into the plugin resources
  - Build the C# / Java part of the plugin
  - Package the plugin
  - Send it for approval to Jetbrains