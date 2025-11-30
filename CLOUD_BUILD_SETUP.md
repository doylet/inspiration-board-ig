# Cloud Build Setup Instructions

## Prerequisites

Your project needs a billing account enabled. Visit:
https://console.cloud.google.com/billing/linkedaccount?project=inspiration-board-ig

## Setup Steps

### 1. Enable Required APIs

```bash
gcloud config set project inspiration-board-ig
gcloud services enable cloudbuild.googleapis.com
gcloud services enable appengine.googleapis.com
gcloud services enable cloudresourcemanager.googleapis.com
```

### 2. Connect GitHub Repository

Go to Cloud Build in Google Cloud Console:
https://console.cloud.google.com/cloud-build/triggers?project=inspiration-board-ig

1. Click **"Connect Repository"**
2. Select **"GitHub"**
3. Authenticate with GitHub
4. Select repository: **doylet/inspiration-board-ig**
5. Click **"Connect"**

### 3. Create Build Trigger

Option A: Using gcloud CLI:

```bash
gcloud builds triggers create github \
  --name="meta-notifications-client-deploy" \
  --description="Deploy meta-notifications-client on push to main" \
  --repo-name="inspiration-board-ig" \
  --repo-owner="doylet" \
  --branch-pattern="^main$" \
  --build-config="cloudbuild.yaml" \
  --project="inspiration-board-ig"
```

Option B: Using Cloud Console:

1. Go to: https://console.cloud.google.com/cloud-build/triggers?project=inspiration-board-ig
2. Click **"Create Trigger"**
3. Configure:
   - **Name**: `meta-notifications-client-deploy`
   - **Description**: `Deploy meta-notifications-client on push to main`
   - **Event**: Push to a branch
   - **Repository**: `doylet/inspiration-board-ig`
   - **Branch**: `^main$`
   - **Configuration**: Cloud Build configuration file (yaml or json)
   - **Location**: `cloudbuild.yaml`
4. Click **"Create"**

### 4. Grant Cloud Build Permissions

Cloud Build needs permission to deploy to App Engine:

```bash
# Get the Cloud Build service account
PROJECT_NUMBER=$(gcloud projects describe inspiration-board-ig --format="value(projectNumber)")
CLOUDBUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

# Grant App Engine Admin role
gcloud projects add-iam-policy-binding inspiration-board-ig \
  --member="serviceAccount:${CLOUDBUILD_SA}" \
  --role="roles/appengine.appAdmin"

# Grant Service Account User role
gcloud projects add-iam-policy-binding inspiration-board-ig \
  --member="serviceAccount:${CLOUDBUILD_SA}" \
  --role="roles/iam.serviceAccountUser"

# Grant Cloud Build Service Account role
gcloud projects add-iam-policy-binding inspiration-board-ig \
  --member="serviceAccount:${CLOUDBUILD_SA}" \
  --role="roles/cloudbuild.builds.builder"
```

### 5. Initialize App Engine (First Time Only)

```bash
gcloud app create --region=us-central --project=inspiration-board-ig
```

### 6. Test the Trigger

#### Manual trigger test:
```bash
gcloud builds triggers run meta-notifications-client-deploy \
  --branch=main \
  --project=inspiration-board-ig
```

#### Or push a change:
```bash
cd /Users/thomasdoyle/Daintree/platforms/meta/inspiration-board-ig
git add -A
git commit -m "Test Cloud Build trigger"
git push origin main
```

### 7. Monitor Build

View build logs:
```bash
gcloud builds list --project=inspiration-board-ig --limit=5
```

Or in the console:
https://console.cloud.google.com/cloud-build/builds?project=inspiration-board-ig

### 8. View Deployed Service

After successful deployment:
```bash
gcloud app browse --project=inspiration-board-ig
```

Or visit: https://inspiration-board-ig.uc.r.appspot.com

## Verify Webhook Configuration

Once deployed, update your Meta/Instagram app settings:

1. Go to https://developers.facebook.com/apps/
2. Select your app → Instagram → Webhooks
3. Update callback URL to: `https://inspiration-board-ig.uc.r.appspot.com/webhook`
4. Verify token: `meta_notifications_verify_token_2025`
5. Click "Verify and Save"

## Troubleshooting

### Build fails with permission errors:
- Ensure Cloud Build service account has proper IAM roles (see step 4)
- Check: https://console.cloud.google.com/iam-admin/iam?project=inspiration-board-ig

### Build fails with billing errors:
- Enable billing: https://console.cloud.google.com/billing/linkedaccount?project=inspiration-board-ig

### App Engine region error:
- You can only create one App Engine app per project
- If already exists in different region, create new project

### Trigger doesn't fire:
- Verify repository connection in Cloud Build
- Check trigger configuration matches branch name exactly
- Ensure GitHub app has access to the repository
