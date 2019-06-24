# A real liveness-probe for Rocket.Chat

We've seen cases where Rocket.Chat's node process is running, but users could not log in.
At the same time, the node process was idling, so it was definitely not a performance issue.
Also, requests to `/api/v1/info` were successful, even logging in via the API was working. Still, as a new session should be created, the client session timed out.

In order to detect situations like these, this repo contains a liveness-check which validates whether users can actually operate the system (e. g. log in and out).

## Prerequisites

Since this liveness-probe really wants to log in using a headless browser, you need to provide a user - default `liveness`, password `1iveness!`
Make sure this user has got no permissions (or very few, such as "guest").

### Headless on Amazon Linux

From [this awesome post](https://medium.com/mockingbot/run-puppeteer-chrome-headless-on-ec2-amazon-linux-ami-6c9c6a17bee6) instructs how to get chrome installed.

Once we've done this, we can configure it to be used later-on.

=> `curl https://intoli.com/install-google-chrome.sh | bash`

Of course, it's more secure to download / copy the script instead of just piping it to the bash ;)

## Installing this package

Until it's not published to npm, for the sake of completeness:

```bash
git clone https://github.com/assistify/rocketchat-liveness-check.git
cd rocketchat-liveness-check
npm i
```

## How to run it

`ASSISTIFY_USER=liveness ASSISTIFY_PASSWORD=1iveness! SERVER=http://localhost:3000 
CHROME=/usr/bin/google-chrome-stable npm run liveness`

You can omit the environment variables if you use the default values
