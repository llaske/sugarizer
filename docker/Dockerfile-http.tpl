FROM mikkl/multiarch-nginx:{ARCH}
WORKDIR /sugarizer-repo
COPY nginx.conf /etc/nginx/nginx.conf
CMD ["nginx", "-g", "daemon off;"]
