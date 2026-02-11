#!/usr/bin/env bash
# ─────────────────────────────────────────────────────
# F1 Live Hub — Google Cloud Run Deployment Script
# ─────────────────────────────────────────────────────
set -euo pipefail

# ── Configuration (edit these) ───────────────────────
PROJECT_ID="${GCP_PROJECT_ID:-}"
REGION="${GCP_REGION:-europe-west1}"
SERVICE_NAME="f1-live-hub"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# ── Pre-flight checks ───────────────────────────────
if [ -z "$PROJECT_ID" ]; then
  echo "❌ GCP_PROJECT_ID is not set."
  echo "   Run:  export GCP_PROJECT_ID=your-project-id"
  exit 1
fi

if ! command -v gcloud &> /dev/null; then
  echo "❌ gcloud CLI not found. Install it from https://cloud.google.com/sdk/docs/install"
  exit 1
fi

echo "🏎️  Deploying F1 Live Hub to Cloud Run"
echo "   Project:  $PROJECT_ID"
echo "   Region:   $REGION"
echo "   Service:  $SERVICE_NAME"
echo ""

# ── Step 1: Set the project ─────────────────────────
gcloud config set project "$PROJECT_ID"

# ── Step 2: Build & push container image ────────────
echo "📦 Building container image..."
gcloud builds submit --tag "$IMAGE_NAME" .

# ── Step 3: Deploy to Cloud Run ─────────────────────
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
  --image "$IMAGE_NAME" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 256Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 3 \
  --set-env-vars "NODE_ENV=production"

# ── Done ─────────────────────────────────────────────
URL=$(gcloud run services describe "$SERVICE_NAME" --region "$REGION" --format 'value(status.url)')
echo ""
echo "✅ Deployed successfully!"
echo "🌐 Live at: $URL"
