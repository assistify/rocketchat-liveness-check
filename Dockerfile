FROM amazonlinux

RUN curl https://intoli.com/install-google-chrome.sh | bash
RUN curl --silent --location https://rpm.nodesource.com/setup_10.x | bash -
RUN yum -y install nodejs
RUN yum -y install git

RUN useradd test

WORKDIR /livenessprobe

#RUN git clone https://github.com/assistify/rocketchat-liveness-check.git /livenessprobe
ADD . /livenessprobe

RUN cd /livenessprobe & npm install
RUN chown -R test /livenessprobe

USER test

ADD start.sh .

CMD [ "sh", "start.sh"]