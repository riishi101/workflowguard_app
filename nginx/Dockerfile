# Build stage
FROM nginx:1.25-alpine as builder

# Install build dependencies
RUN apk add --no-cache \
    gcc \
    make \
    libc-dev \
    pcre-dev \
    zlib-dev \
    linux-headers \
    curl \
    gnupg \
    libxslt-dev \
    gd-dev \
    geoip-dev \
    perl-dev \
    libedit-dev \
    mercurial \
    bash \
    alpine-sdk \
    findutils \
    git

# Download and extract nginx source
WORKDIR /usr/src/
RUN wget http://nginx.org/download/nginx-1.25.3.tar.gz && \
    tar -zxvf nginx-1.25.3.tar.gz && \
    rm nginx-1.25.3.tar.gz

# Configure nginx with stream module
WORKDIR /usr/src/nginx-1.25.3
RUN ./configure \
    --with-http_ssl_module \
    --with-http_v2_module \
    --with-http_gzip_static_module \
    --with-http_stub_status_module \
    --with-stream \
    --with-stream_ssl_module \
    --with-http_realip_module \
    --with-http_geoip_module \
    --with-threads \
    --with-file-aio \
    --with-http_sub_module \
    --with-http_gunzip_module \
    --with-http_gzip_static_module \
    --with-http_slice_module && \
    make && make install

# Final stage
FROM nginx:1.25-alpine

# Copy custom nginx binary with stream module
COPY --from=builder /usr/local/nginx/sbin/nginx /usr/sbin/nginx

# Copy nginx config files
COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx-ssl.conf /etc/nginx/conf.d/default.conf

# Create necessary directories
RUN mkdir -p /var/log/nginx && \
    touch /var/log/nginx/access.log && \
    touch /var/log/nginx/error.log && \
    chown -R nginx:nginx /var/log/nginx && \
    chmod -R 755 /var/log/nginx

# Expose ports
EXPOSE 80 443

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
