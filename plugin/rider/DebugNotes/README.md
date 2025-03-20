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

# Dumping a few things I learned this session and might forget until next time
## Protocol
Files in `protocol` are used to generate C# and kt code.
Normally we can launch the `generateProtocol` task to generate the code,
and after the initial setup it runs very fast.
The C# code goes to `src/dotnet/ResharperPlugin.DebugNotes/XXX.Generated.cs`.
The kt code goes to `src/rider/main/kotlin/com/jetbrains/rider/plugins/samples/protocol/XXX.Generated.kt`.
It also has "signals" that allow the backend (C# part) to send messages to the frontend (kt part), and,
I think, that also allows the frontend to send messages to the backend.
From what I've seen, the syntax is the same for both ways.
In the old version of the plugin, the backend calls "Call" and "Method" on the frontend,
and the frontend calls "NavigateMethod" on the backend.

## Actions
Actions are defined in two places:
- `src/dotnet/ReSharperPlugin.DebugNotes/Action/XXXAction.cs` for the C# part
- `src/rider/main/kotlin/com/jetbrains/rider/plugins/samples/actions/XXXAction.kt` for the kt part
As of now, the actions are still registered using the "old" way, with action ids.
The new way is different mostly in that it supports i18n, based on weird resources stuff. There is an example
in rider plugin samples "Action" example.
- They are then registered in `plugin.xml`

## Component
The `Component` (`DebugNotesComponent`) is (at least in the context of this plugin) the main entry point of the plugin.
I'm not sure how Rider / Resharper register it, because I don't see it named anywhere.
Maybe it's the `[SolutionComponent]` attribute.
Then:
- Actions are passed a `Context` that allow to retrieve the Component.
- The Component, in turn, has access to the model, which provides access to the "front" (Java) part, 
that allows to send messages to the front (kt) part. There is an example of that in the old version,
and also, I think, in the `RdProtocol` example of the Rider plugin samples.

## The Tool Window
This is the front part of the plugin. I haven't worked on it this session so I wouldn't know much,
I have only seen that it calls methods on the backend using the model (i.e. the protocol).
