# 🚀 Production Deployment & Google Play Store Launch Guide

This document provides a comprehensive, step-by-step guide to deploying **The DABBA Company (TDC)** SaaS platform infrastructure to production and launching the **Customer Mobile App** (Flutter) to the Google Play Store.

---

## 📋 Table of Contents

1. [Infrastructure Deployment (Backend & Dashboards)](#1-infrastructure-deployment-backend--dashboards)
   - [Cloud Architecture Overview](#cloud-architecture-overview)
   - [Step 1: Container Registry Setup](#step-1-container-registry-setup)
   - [Step 2: Database & Caching Provisioning](#step-2-database--caching-provisioning)
   - [Step 3: Configuring Kubernetes Secrets & ConfigMaps](#step-3-configuring-kubernetes-secrets--configmaps)
   - [Step 4: Deploying to Kubernetes Cluster](#step-4-deploying-to-kubernetes-cluster)
   - [Step 5: Ingress, SSL, and Domain Configuration](#step-5-ingress-ssl-and-domain-configuration)
2. [Google Play Store Launch (Flutter Customer App)](#2-google-play-store-launch-flutter-customer-app)
   - [Step 1: Initialize Android Platforms (If Missing)](#step-1-initialize-android-platforms-if-missing)
   - [Step 2: Google Play Console Account Setup](#step-2-google-play-console-account-setup)
   - [Step 3: App Identity & Package Configuration](#step-3-app-identity--package-configuration)
   - [Step 4: Launcher Icons & Assets Generation](#step-4-launcher-icons--assets-generation)
   - [Step 5: App Signing Setup (Keystore)](#step-5-app-signing-setup-keystore)
   - [Step 6: Setting Production API Endpoint](#step-6-setting-production-api-endpoint)
   - [Step 7: Build the Android App Bundle (AAB)](#step-7-build-the-android-app-bundle-aab)
   - [Step 8: Play Store Submission & Release Tracks](#step-8-play-store-submission--release-tracks)
3. [Post-Launch & Monitoring](#3-post-launch--monitoring)
   - [Observability](#observability)
   - [Backups & Disaster Recovery](#backups--disaster-recovery)

---

## 1. Infrastructure Deployment (Backend & Dashboards)

### Cloud Architecture Overview

For a production grade deployment, we use a managed Kubernetes service (e.g., AWS EKS, Google GKE, or DigitalOcean Kubernetes) behind a Load Balancer, coupled with managed database services for high availability.

```
                  [ Users / Mobile App / Web ]
                               │
                               ▼
               [ Cloud Load Balancer (HTTPS) ]
                               │
                               ▼
                     [ Kubernetes Ingress ]
                               │
            ┌──────────────────┼──────────────────┐
            ▼                  ▼                  ▼
     [ tdc-backend ]     [ admin-dash ]     [ partner-dash ]
      (Replicas: 3+)     (Replicas: 2+)     (Replicas: 2+)
            │
            ├───────────────┬────────────────┐
            ▼               ▼                ▼
     [ Managed DB ]   [ Redis Cache ]  [ Meilisearch ]
     (AWS RDS PG)     (AWS ElastiCache)(Search Cluster)
```

### Step 1: Container Registry Setup

You need to build and push Docker images for our three web workspaces to a container registry (Docker Hub, AWS ECR, or GitHub Container Registry):

1. **Dockerize and Push NestJS Backend**:
   ```bash
   # Build the image from root
   docker build -t yourregistry/tdc-backend:latest -f apps/backend/Dockerfile .
   # Push to registry
   docker push yourregistry/tdc-backend:latest
   ```

2. **Dockerize and Push Admin Dashboard**:
   Create a Dockerfile in `apps/admin-dashboard` and push the built image:
   ```bash
   docker build -t yourregistry/tdc-admin-dashboard:latest apps/admin-dashboard/
   docker push yourregistry/tdc-admin-dashboard:latest
   ```

3. **Dockerize and Push Partner Dashboard**:
   Create a Dockerfile in `apps/partner-dashboard` and push the built image:
   ```bash
   docker build -t yourregistry/tdc-partner-dashboard:latest apps/partner-dashboard/
   docker push yourregistry/tdc-partner-dashboard:latest
   ```

### Step 2: Database & Caching Provisioning

While [databases.yaml](file:///D:/TDC/kubernetes/databases.yaml) sets up in-cluster databases, it is highly recommended to use managed instances for production:
- **PostgreSQL**: AWS RDS PostgreSQL (Multi-AZ enabled, version 16).
- **Redis**: AWS ElastiCache for Redis (Clustered mode).
- **Meilisearch**: Meilisearch Cloud or self-hosted statefulset with persistent storage.

### Step 3: Configuring Kubernetes Secrets & ConfigMaps

Update the values in [config-secrets.yaml](file:///D:/TDC/kubernetes/config-secrets.yaml) to point to your production database endpoints and secret credentials:

1. Open [config-secrets.yaml](file:///D:/TDC/kubernetes/config-secrets.yaml).
2. Replace credentials under `stringData` with secure production keys:
   - `DB_USERNAME` & `DB_PASSWORD`: Managed DB credentials.
   - `JWT_SECRET` & `JWT_REFRESH_SECRET`: Strong cryptographically secure strings (e.g. generated via `openssl rand -base64 32`).
   - `MEILISEARCH_API_KEY`: Production admin key.
3. Replace host addresses under `data` with your managed instances:
   - `DB_HOST`: e.g. `tdc-prod.c123456789.ap-south-1.rds.amazonaws.com`
   - `REDIS_HOST`: e.g. `tdc-redis.ap-south-1.cache.amazonaws.com`
   - `MEILISEARCH_HOST`: Production endpoint url.

Apply config parameters to your Kubernetes cluster:
```bash
kubectl apply -f kubernetes/config-secrets.yaml
```

### Step 4: Deploying to Kubernetes Cluster

Apply the database configuration (if using self-hosted services) and workspace deployment manifests:

```bash
# 1. Apply persistent storage & databases (if self-hosted)
kubectl apply -f kubernetes/databases.yaml

# 2. Deploy the NestJS Backend API
kubectl apply -f kubernetes/backend.yaml

# 3. Deploy the Next.js Dashboards
kubectl apply -f kubernetes/admin-dashboard.yaml
kubectl apply -f kubernetes/partner-dashboard.yaml
```

*Note: Update the `image` field in `backend.yaml`, `admin-dashboard.yaml`, and `partner-dashboard.yaml` to your pushed image tag from Step 1.*

### Step 5: Ingress, SSL, and Domain Configuration

To map production traffic properly and enable SSL/TLS:

1. **Install Nginx Ingress Controller** (if not already installed in your cluster):
   ```bash
   kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml
   ```

2. **Configure TLS Certificates**: Use Let's Encrypt with `cert-manager`.
   ```bash
   kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
   ```
   Create a ClusterIssuer for Let's Encrypt Production:
   ```yaml
   apiVersion: cert-manager.io/v1
   kind: ClusterIssuer
   metadata:
     name: letsencrypt-prod
   spec:
     acme:
       server: https://acme-v02.api.letsencrypt.org/directory
       email: security@thedabbacompany.com
       privateKeySecretRef:
         name: letsencrypt-prod-private-key
       solvers:
         - http01:
             ingress:
               class: nginx
   ```

3. **Update Ingress Rules**:
   Modify [ingress.yaml](file:///D:/TDC/kubernetes/ingress.yaml) to map your custom domain (e.g., `thedabbacompany.com`) and add TLS configuration:
   ```yaml
   apiVersion: networking.k8s.io/v1
   kind: Ingress
   metadata:
     name: tdc-ingress
     namespace: default
     annotations:
       cert-manager.io/cluster-issuer: "letsencrypt-prod"
       nginx.ingress.kubernetes.io/ssl-redirect: "true"
   spec:
     ingressClassName: nginx
     tls:
       - hosts:
           - api.thedabbacompany.com
           - admin.thedabbacompany.com
           - partner.thedabbacompany.com
         secretName: tdc-tls-certs
     rules:
       - host: api.thedabbacompany.com
         http:
           paths:
             - path: /
               pathType: Prefix
               backend:
                 service:
                   name: tdc-backend
                   port:
                     number: 3000
       - host: admin.thedabbacompany.com
         http:
           paths:
             - path: /
               pathType: Prefix
               backend:
                 service:
                   name: tdc-admin-dashboard
                   port:
                     number: 3001
       - host: partner.thedabbacompany.com
         http:
           paths:
             - path: /
               pathType: Prefix
               backend:
                 service:
                   name: tdc-partner-dashboard
                   port:
                     number: 3002
   ```
   Apply the ingress configurations:
   ```bash
   kubectl apply -f kubernetes/ingress.yaml
   ```

4. **DNS Setup**: Point the DNS A-records of your subdomains (`api`, `admin`, `partner`) to the External IP of your Kubernetes LoadBalancer.

---

## 2. Google Play Store Launch (Flutter Customer App)

The Customer Mobile App is built using **Flutter**. Before releasing it to the Play Store, it must be customized, signed, and compiled into an Android App Bundle.

### Step 1: Initialize Android Platforms (If Missing)

If your repository doesn't have the `android` directory under `apps/mobile-app` (e.g. standard workspace setup), run the following command to generate the platform folders:
```bash
cd apps/mobile-app
flutter create --platforms=android .
```

### Step 2: Google Play Console Account Setup

1. **Sign Up**: Register for a developer account at the [Google Play Console](https://play.google.com/console/signup).
2. **Fee**: Pay the one-time $25 registration fee.
3. **Verify Identity**: Complete the identity verification steps (national ID & phone number).
4. **Create App**:
   - Log in to the Play Console and click **Create app**.
   - Fill in: **App name** ("The DABBA Company"), **Default language**, and choose **App** (not Game) and **Free** (or Paid).

### Step 3: App Identity & Package Configuration

1. **Modify Package Name (Application ID)**:
   In `apps/mobile-app/android/app/build.gradle`, modify the `applicationId` to match your unique domain-style ID:
   ```groovy
   defaultConfig {
       applicationId "com.thedabbacompany.customer"
       minSdkVersion 21
       targetSdkVersion 34
       versionCode flutterVersionCode.toInteger()
       versionName flutterVersionName
   }
   ```
2. **Rename Packages in Code**: Change imports and directory structure under `android/app/src/main/` (Java/Kotlin files) to match `com.thedabbacompany.customer`.
3. **Set App Name**:
   Update the label attribute in `android/app/src/main/AndroidManifest.xml`:
   ```xml
   <application
       android:label="The DABBA Company"
       android:icon="@mipmap/ic_launcher">
   ```

### Step 4: Launcher Icons & Assets Generation

Generate professional branded launcher icons rather than using default Flutter icons.

1. **Add `flutter_launcher_icons`**:
   Add this to your `apps/mobile-app/pubspec.yaml`:
   ```yaml
   dev_dependencies:
     flutter_launcher_icons: ^0.13.1

   flutter_launcher_icons:
     android: "launcher_icon"
     ios: true
     image_path: "assets/icon/app_icon.png"
     adaptive_icon_background: "#FFFFFF" # Set theme-matching background
     adaptive_icon_foreground: "assets/icon/app_icon_foreground.png"
   ```
2. **Generate Assets**:
   Run the build script:
   ```bash
   flutter pub get
   flutter pub run flutter_launcher_icons
   ```

### Step 5: App Signing Setup (Keystore)

Google Play requires all apps to be digitally signed before they are uploaded.

1. **Generate the Keystore File**:
   Run the `keytool` command on Windows PowerShell to generate a secure keystore file:
   ```powershell
   keytool -genkey -v -keystore D:\TDC\apps\mobile-app\android\app\upload-keystore.jks -storetype JKS -keyalg RSA -keysize 2048 -validity 10000 -alias upload
   ```
   *Keep a secure record of the keystore password and alias.*

2. **Configure Credentials securely**:
   Create a file `apps/mobile-app/android/key.properties` (Make sure this file is added to `.gitignore` so it's never committed to version control):
   ```properties
   storePassword=your_keystore_password
   keyPassword=your_key_password
   keyAlias=upload
   storeFile=upload-keystore.jks
   ```

3. **Update Build Configuration**:
   Edit `apps/mobile-app/android/app/build.gradle` to load and apply your keystore:
   ```groovy
   def keystoreProperties = new Properties()
   def keystorePropertiesFile = rootProject.file('key.properties')
   if (keystorePropertiesFile.exists()) {
       keystoreProperties.load(new java.io.FileInputStream(keystorePropertiesFile))
   }

   android {
       ...
       signingConfigs {
           release {
               storeFile file("upload-keystore.jks")
               storePassword keystoreProperties['storePassword']
               keyAlias keystoreProperties['keyAlias']
               keyPassword keystoreProperties['keyPassword']
           }
       }
       buildTypes {
           release {
               signingConfig signingConfigs.release
               minifyEnabled true
               shrinkResources true
               proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
           }
       }
   }
   ```

### Step 6: Setting Production API Endpoint

Ensure the Flutter app communicates with your live production backend instead of `localhost`.

Update the API configuration utility file (e.g. `apps/mobile-app/lib/services/api_client.dart` or your environment config):
```dart
// Change from local mock url to production ingress route:
const String baseUrl = "https://api.thedabbacompany.com/api/v1";
```

### Step 7: Build the Android App Bundle (AAB)

The Android App Bundle (`.aab`) is Google's publishing format which automatically optimizes app downloads for target devices.

1. **Bump Version Code**: Ensure your version details are incremented in `pubspec.yaml` on every release:
   ```yaml
   version: 1.0.0+2  # Major.Minor.Patch+BuildNumber (increment build number by +1 each release)
   ```
2. **Build Release Bundle**:
   ```bash
   cd apps/mobile-app
   flutter clean
   flutter pub get
   flutter build appbundle --release
   ```
   The compiled file will be saved at:
   `apps/mobile-app/build/app/outputs/bundle/release/app-release.aab`

### Step 8: Play Store Submission & Release Tracks

1. **Upload Asset in Play Console**:
   - Select your App from the Play Console Dashboard.
   - Go to **Testing** -> **Internal testing** (Recommended for first deployments).
   - Create a new release, upload the `app-release.aab` file, and fill in release notes.
2. **Setup Store Listing**:
   - Provide **Short Description** and **Full Description**.
   - Upload graphics assets (App Icon: 512x512 PNG, Feature Graphic: 1024x500 JPG/PNG, Phone screenshots: 2-8 images, Tablet screenshots).
   - Set the Category, Tagging, and Contact details.
3. **App Content Questionnaire**:
   - Complete standard questionnaires: Privacy policy URL, target audience (18+ or general), content rating, ads declarations.
4. **Rollout to Production**:
   - Once Internal testing checks pass without errors, promote the build to **Closed testing** (Beta) or direct **Production**.
   - Submit for Review (Review usually takes 1 to 5 business days for new developer accounts).

---

## 3. Post-Launch & Monitoring

### Observability
- **Error Tracking**: Integrate **Sentry** (SDKs for NestJS, Next.js, and Flutter) to monitor exceptions in real-time.
- **Metrics**: Enable Prometheus scraping on `/metrics` endpoint in NestJS, and visualize memory/throughput using Grafana.
- **Log Aggregation**: Install Loki or Datadog agent inside the Kubernetes cluster to stream container output.

### Backups & Disaster Recovery
- Set automated daily snapshots for AWS RDS database with a retention period of 14+ days.
- Ensure Kubernetes config secrets and keystore files (`upload-keystore.jks` and `key.properties`) are backed up securely outside Git (e.g. in a private password manager or encrypted AWS S3 vault). Loss of keystore files prevents you from uploading updates to existing Play Store listings.
