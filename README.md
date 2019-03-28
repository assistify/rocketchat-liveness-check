# A real liveness-probe for Rocket.Chat

We've seen cases where Rocket.Chat's node process is running, but users could not log in.
At the same time, the node process was idling, so it was definitely not a performance issue.
Also, requests to `/api/v1/info` were successful, even logging in via the API was working. Still, as a new session should be created, the client session timed out.

In order to detect situations like these, this repo contains a liveness-check which validates whether users can actually operate the system (e. g. log in and out).

## Prerequisites

Since this liveness-probe really wants to log in using a headless browser, you need to provide a user - default `liveness`, password `1iveness!`
Make sure this user has got no permissions (or very few, such as "guest").

## How to run it

`USER=liveness PASSWORD=1iveness! SERVER=http://localhost:3000 npm start`

You can omit the environment variables if you use the default values