# Dockerfile برای سرور HTML to APK Builder
# ساخت ایمیج: docker build -t html-to-apk-server .
# اجرا: docker run -p 3001:3001 html-to-apk-server

FROM node:18-bullseye

# نصب پیش‌نیازها
RUN apt-get update && apt-get install -y \
    openjdk-17-jdk \
    wget \
    unzip \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# تنظیم JAVA_HOME
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64

# دانلود و نصب Android SDK Command-line Tools
ENV ANDROID_HOME=/opt/android-sdk
ENV ANDROID_SDK_ROOT=/opt/android-sdk

RUN mkdir -p ${ANDROID_HOME}/cmdline-tools && \
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O /tmp/cmdline-tools.zip && \
    unzip -q /tmp/cmdline-tools.zip -d ${ANDROID_HOME}/cmdline-tools && \
    mv ${ANDROID_HOME}/cmdline-tools/cmdline-tools ${ANDROID_HOME}/cmdline-tools/latest && \
    rm /tmp/cmdline-tools.zip

# تنظیم PATH
ENV PATH="${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/platform-tools:${ANDROID_HOME}/build-tools/34.0.0:${PATH}"

# پذیرش لایسنس‌های Android SDK
RUN yes | sdkmanager --licenses || true

# نصب پکیج‌های ضروری Android SDK
RUN sdkmanager "platform-tools" \
    "platforms;android-34" \
    "build-tools;34.0.0" \
    "extras;google;m2repository"

# نصب Cordova
RUN npm install -g cordova

# ساخت پوشه کاری
WORKDIR /app

# کپی package.json و نصب وابستگی‌ها
COPY package*.json ./
RUN npm install --production

# کپی کد سرور
COPY . .

# ساخت پوشه temp
RUN mkdir -p temp

# پورت
EXPOSE 3001

# متغیرهای محیطی
ENV NODE_ENV=production

# اجرای سرور
CMD ["node", "build-server.js"]
