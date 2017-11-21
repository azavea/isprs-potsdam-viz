FROM openjdk:8-jre-alpine

RUN \
      addgroup -S server \
      && adduser -D -S -h /var/lib/server -s /sbin/nologin -G server server

COPY target/scala-2.11/potsdam-server.jar /var/lib/server/

USER server
WORKDIR /var/lib/server

ENTRYPOINT ["java"]
CMD ["-jar", "potsdam-server.jar"]
