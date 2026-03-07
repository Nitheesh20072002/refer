
# 🔧 Fix Authentication Error - Artifact Registry Setup

## The Problem

You're seeing this error:
```
denied: Unauthenticated request. Unauthenticated requests do not have permission 
"artifactregistry.repositories.uploadArtifacts" on resource 
"projects/***/locations/us/repositories/gcr.io" (or it may not exist)
```

This happens because:
1. Google Container Registry (gcr.io) is deprecated
2. You need to use **Artifact Registry** instead
3. Your service account needs proper permissions

## ✅ Solution Steps

### Step 1: Enable Artifact Registry API

1. Go to: https://console.cloud.google.com/apis/library
2. Search for: **"Artifact Registry API"**
3. Click **ENABLE**
4. Wait for it to enable (~30 seconds)

### Step 2: Create Artifact Registry Repository

1. Go to: https://console.cloud.google.com/artifacts
2. Click **+ CREATE REPOSITORY**
3. Fill in these details:
   - **Name:** `referloop` (must be exactly this)
   - **Format:** Docker
   - **Mode:** Standard
   - **Location type:** Region
   - **Region:** Select the same region as your `GCP_REGION` secret (e.g., `us-central1`)
   - **Encryption:** Google-managed encryption key
4. Click **CREATE**

### Step 3: Grant Service Account Permissions

Your GitHub Actions service account needs permission to push images:

1. Go to: https://console.cloud.google.com/iam-admin/iam
2. Find your service account (looks like: `github-actions@your-project.iam.gserviceaccount.com`)
3. Click the **pencil icon** (Edit) next to it
4. Click **+ ADD ANOTHER ROLE**
5. Search for and add: **Artifact Registry Writer**
6. Click **SAVE**

### Step 4: Verify Your GitHub Secrets

Make sure you have these secrets set in GitHub:

Go to: https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions

Required secrets:
- `GCP_PROJECT_ID` - Your Google Cloud project ID
- `GCP_REGION` - Your region (e.g., `us-central1`) - **must match repository region**
- `GCP_SA_KEY` - Your service account JSON key (entire JSON file content)

### Step 5: Push Your Updated Workflow

The workflow has been updated to use Artifact Registry format. Now push it:

```bash
git add .github/workflows/build-deploy.yml
git commit -m "fix: Update workflow to use Artifact Registry"
git push origin main
```

### Step 6: Monitor the Workflow

1. Go to your GitHub repository
2. Click on **Actions** tab
3. Watch the "Build and Push Docker Images to GCR" workflow run
4. It should now succeed!

## 📝 What Changed

### Old Format (GCR - Deprecated)
```
gcr.io/YOUR_PROJECT_ID/referloop-backend:latest
```

### New Format (Artifact Registry - Current)
```
us-central1-docker.pkg.dev/YOUR_PROJECT_ID/referloop/backend:latest
```

## 🎯 Your Image Locations

After successful push, your images will be at:

- **Backend:** `{REGION}-docker.pkg.dev/{PROJECT_ID}/referloop/backend:latest`
- **Frontend:** `{REGION}-docker.pkg.dev/{PROJECT_ID}/referloop/frontend:latest`

Example:
- `us-central1-docker.pkg.dev/my-project/referloop/backend:latest`
- `us-central1-docker.pkg.dev/my-project/referloop/frontend:latest`

## 🚀 Deploying to Cloud Run

When deploying to Cloud Run, use these steps:

1. Go to: https://console.cloud.google.com/run
2. Click **CREATE SERVICE**
3. Select **Deploy one revision from an existing container image**
4. Click **SELECT**
5. Navigate to **Artifact Registry** tab (NOT Container Registry)
6. Select repository: `referloop`
7. Select image: `backend` or `frontend`
8. Select tag: `latest`
9. Continue with deployment

## 💰 Cost Impact

Artifact Registry costs:
- **Storage:** $0.10/GB per month
- **First 0.5 GB:** Free
- **Your images (~1GB):** ~$0.10-0.20/month

This is much cheaper than rebuilding images every time!

## 🔍 Troubleshooting

### Still getting authentication error?

**Check 1: Is Artifact Registry API enabled?**
- Go to: https://console.cloud.google.com/apis/library/artifactregistry.googleapis.com
- Should say "API enabled"

**Check 2: Does repository exist?**
- Go to: https://console.cloud.google.com/artifacts
- You should see `referloop` repository
- Click on it - it should be empty initially

**Check 3: Service account has correct role?**
- Go to: https://console.cloud.google.com/iam-admin/iam
- Find your service account
- Should have role: "Artifact Registry Writer"

**Check 4: Region matches?**
- Repository region must match your `GCP_REGION` secret
- If mismatch, delete repository and recreate in correct region

**Check 5: Service account key is valid?**
- The `GCP_SA_KEY` secret should be the entire JSON content
- No extra spaces or newlines
- Should start with `{` and end with `}`

### Can't find images after push?

1. Go to: https://console.cloud.google.com/artifacts
2. Click on `referloop` repository
3. You should see folders: `backend` and `frontend`
4. Click into each to see image tags
5. Should see `latest` and commit SHA tags

### Need to recreate repository?

If you created it in the wrong region:
1. Go to: https://console.cloud.google.com/artifacts
2. Select the repository
3. Click **DELETE**
4. Create new repository in correct region
5. Re-run GitHub Actions workflow

## ✅ Success Checklist

- [ ] Artifact Registry API is enabled
- [ ] Repository named `referloop` exists
- [ ] Repository region matches `GCP_REGION` secret
- [ ] Service account has "Artifact Registry Writer" role
- [ ] All GitHub secrets are set correctly
- [ ] Workflow file is updated and pushed
- [ ] GitHub Actions workflow runs successfully
- [ ] Images appear in Artifact Registry console

---

**After completing these steps, your workflow will successfully push Docker images!**
