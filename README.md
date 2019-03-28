# A real liveness-probe for Rocket.Chat

We've seen cases where Rocket.Chat's node process is running, but users could not log in.
At the same time, the node process was idling, so it was definitely not a performance issue.
Also, requests to `/api/v1/info` were successful, even logging in via the API was working. Still, as a new session should be created, the client session timed out.

In order to detect situations like these, this repo contains a liveness-check which validates whether users can actually operate the system (e. g. log in and out).

## Prerequisites

Since this liveness-probe really wants to log in using a headless browser, you need to provide a user - default `liveness`, password `1iveness!`
Make sure this user has got no permissions (or very few, such as "guest").

### Headless on Amazon Linux

From [this awesome article](https://medium.com/mockingbot/run-puppeteer-chrome-headless-on-ec2-amazon-linux-ami-6c9c6a17bee6)

`yum install -y cups-libs dbus-glib libXrandr libXcursor libXinerama cairo cairo-gobject pango`

By the time of writing, the following versions were current
- `rpm -ivh --nodeps http://mirror.centos.org/centos/7/os/x86_64/Packages/atk-2.28.1-1.el7.x86_64.rpm`
- `rpm -ivh --nodeps http://mirror.centos.org/centos/7/os/x86_64/Packages/at-spi2-atk-2.26.2-1.el7.x86_64.rpm`
- `rpm -ivh --nodeps http://mirror.centos.org/centos/7/os/x86_64/Packages/at-spi2-core-2.28.0-1.el7.x86_64.rpm`

- `rpm -ivh --nodeps http://dl.fedoraproject.org/pub/archive/fedora/linux/releases/20/Fedora/x86_64/os/Packages/g/GConf2-3.2.6-7.fc20.x86_64.rpm`
- `rpm -ivh --nodeps http://dl.fedoraproject.org/pub/archive/fedora/linux/releases/20/Fedora/x86_64/os/Packages/l/libxkbcommon-0.3.1-1.fc20.x86_64.rpm`
- `rpm -ivh --nodeps http://dl.fedoraproject.org/pub/archive/fedora/linux/releases/20/Fedora/x86_64/os/Packages/l/libwayland-client-1.2.0-3.fc20.x86_64.rpm`
- `rpm -ivh --nodeps http://dl.fedoraproject.org/pub/archive/fedora/linux/releases/20/Fedora/x86_64/os/Packages/l/libwayland-cursor-1.2.0-3.fc20.x86_64.rpm`
- `rpm -ivh --nodeps http://dl.fedoraproject.org/pub/archive/fedora/linux/releases/20/Fedora/x86_64/os/Packages/g/gtk3-3.10.4-1.fc20.x86_64.rpm`

- `rpm -ivh --nodeps http://dl.fedoraproject.org/pub/archive/fedora/linux/releases/16/Fedora/x86_64/os/Packages/gdk-pixbuf2-2.24.0-1.fc16.x86_64.rpm`

## Installing this package

Until it's not published to npm, for the sake of completeness:

```bash
git clone https://github.com/assistify/rocketchat-liveness-check.git
cd rocketchat-liveness-check
npm i
```

## How to run it

`USER=liveness PASSWORD=1iveness! SERVER=http://localhost:3000 npm start`

You can omit the environment variables if you use the default values