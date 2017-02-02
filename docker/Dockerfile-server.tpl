FROM mikkl/multiarch-node:{ARCH}
WORKDIR /sugarizer-repo/server
CMD npm install; nodejs /sugarizer-repo/server/sugarizer.js /sugarizer-repo/docker/sugarizer-docker.ini
