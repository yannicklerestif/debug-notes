# DebugNotes for Rider and ReSharper
## 0. Prerequisites
- Java 17 ([Amazon Corretto](https://docs.aws.amazon.com/corretto/latest/corretto-17-ug/what-is-corretto-17.html) is recommended)
  - Make sure both the `Path` and `JAVA_HOME` are correctly updated

## 1. Run plugin locally
To run the plugin locally:
- Launch the Webpack webserver (see front part)
- Open the Gradle project in which this file is
- Run the `Rider` launch configuration (or run `build.gradle/runIde` task, this is the same)
  - When launching locally, the webview is served from the Webpack web server. If the Debug Notes tool window is empty, it's probably because you forgot to run the front (see above)
  - Run the Gradle plugin in Intellij if you want to debug the Java part
  - Run from the `Rider` launch configuration in Rider if you want to debug the C# part

## 2. Build and publish the plugin 
To create and publish a new version of the plugin:
- Update the version in [gradle.properties](./gradle.properties)
- Choose the channel in the `publishPlugin` task of [build.gradle](./build.gradle)
- Make sure the file `token` is set (in the parent directory of the directory this file is in)
- Launch the task `publishPlugin` from [build.gradle](./build.gradle). This will:
  - Build the front part of the plugin (`buildWebview`) and copy the generated artifacts into the plugin resources
  - Build the C# / Java part of the plugin
  - Package the plugin
  - Send it for approval to Jetbrains
  - If the version doesn't exist yet, `publishPlugin` will complain that the `File does not exist`.
This doesn't prevent the built / submission from working.

## 3. Version changing notes
Use the [template plugin](https://github.com/JetBrains/resharper-rider-plugin/blob/master/template/content/build.gradle) in Github to get the versions below, hopefull they will be recent
- Modify the plugins versions in [build.gradle](./build.gradle)
- Modify the `ProductVersion` in [gradle.properties](./gradle.properties) to match a recent version of Rider
- Modify the `SdkVersion` in the [protocol's Plugin.props](./src/dotnet/Plugin.props) to match the Product Version