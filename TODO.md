# TODO
## Backend
On the backend side
- Of course the main thing is to create a server hosted in the Cloud to provide the endpoints
for the browser and the IDE.
- It will also need to host the front-end to avoid CORS issues.

## Frontend
On the frontend side, we still need to:
- Send messages to the backend when the user navigates to a method, class or call
- Setup the "userId" and "browserId"
  - It seems easier to let the browser own the userId, because it can then easily stored in a central place
    in the browser's local storage.
  - The browserId could simply be a random uuid generated at startup. Not sure storing it in a session storage
    (IIRC it remains if the page is refreshed) is a good idea.
- A "connected" status, and a button to reconnect, might be a good idea. Also sending messages should probably
  reconnect. But maybe it's fine to connect when the page loads and rely of page reload to reconnect.
- Maybe the active browser could be always connected. It probably makes sense for most use-cases.

## Plugin
On the plugin side:
- Write the loop to listen to browser messages to navigate to methods, classes and calls
- Implement the "connection" logic (we can't just refresh like we could for the browser):
  - "Connect" button
  - "Connected" status, ideally (not sure where to show that)
  - Reconnect on message send
  - Disconnect if the browser asks us to
- Setup the "userId" and "browserId" logic
  - Will probably need an "options" page to set the userId, and a button to copy it from the browser
  - Would need that userId to be stored in a central place so the user doesn't have to set it up every time
  - The ideId could probably be a random uuid generated at startup. The only downside is that we will be
    disconnected if we restart. But maybe that's actually better. Maybe the active IDE could be the one.

## Build
- Will need to setup the build all over again, because it's not in the "new" plugin yet.
- Will need to push it to the store of course
- Might have to do some of the "dev mode" stuff too (e.g. serve the front from the backend / proxy calls)

## Misc
- Will also need to document things, not sure I have written all of it down
- Will need to cleanup the old plugin eventually