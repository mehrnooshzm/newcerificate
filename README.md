# Certificate Generation Platform (Certi4U)

Built with:

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express

## Table of Contents

- [Project Structure](#project-structure)
- [Installation](#installation)
- [Local Development](#local-development)
- [Build and Production](#build-and-production)

## Project Structure

```
.
├── client/            # React frontend (Vite + Tailwind CSS)
├── server/            # Express backend
├── package.json       # Root scripts for running and building the app
├── package-lock.json
├── .gitignore
└── README.md
```

## Batch Certificate Download & Email Delivery
```bash
The batch export feature allows users to select multiple certificate records, create a ZIP file, store it in Supabase Storage, and receive the download link by email and also display in UI.
```

### Batch Export Flow
```Bash
1. Select Records – Users select multiple certificate records from the dashboard. A saved 
   design is required for batch export.
2. Generate PDFs – The frontend generates an individual PDF for each selected record and 
   sends the PDFs to:
   POST /api/certificates/batch-export
3. Create ZIP – The backend uses Archiver to combine the PDFs into following and a jobId is 
   returned to the frontend for tracking:
   certificates-{jobId}.zip
4. Track Progress – The frontend polls to display the export progress and job status:
   GET /api/certificates/batch-export/{jobId}
5. Store ZIP – The completed ZIP is uploaded to the certificate-exports Supabase Storage 
   bucket, and a signed download URL valid for 7 days is generated.
6. Download & Email – The frontend downloads the ZIP and sends the same signed URL through 
   EmailJS.
7. Error Handling & Cleanup – Failed jobs display an error to the user. If email delivery 
   fails, the ZIP remains available and the user can copy the download link. Temporary server files are cleaned up after processing.
```

### Workflow
```Bash
Select Multiple Records
          ↓
Generate Individual PDFs (Frontend)
          ↓
Send PDFs to Backend
          ↓
Create ZIP with Archiver
          ↓
Poll Job Status
          ↓
Upload ZIP to Supabase
          ↓
Generate 7-Day Signed URL
          ↓
Download ZIP
          ↓
Send Link via EmailJS
```

### EmailJS Setup
```bash
EmailJS is used to send the certificate ZIP download link to the logged-in user's email address.
```
1. Install EmailJS
From the `client` folder:
```bash
npm install @emailjs/browser
```

2. Configure Environment Variables
```bash
An existing .env file is available in the client folder. Replace the values with the credentials from your EmailJS account: 

VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key

After changing the .env file, restart the Vite development server.
```
> **Note:** The current credentials are configured for testing. For deployment, the association can replace these values with its own EmailJS service, template, and public key.
>  Do not commit .env files containing credentials to the repository.


3. EmailJS Template
```bash
The EmailJS template should include these variables:

{{to_name}}
{{to_email}}
{{certificate_count}}
{{download_url}}

The download_url contains the signed ZIP link.
```

## Testing

The batch certificate download and email delivery features are tested using **Cypress**.

### Install Cypress

From the `client` folder:

```bash
npm install cypress 
```
### Cypress Environment

Create `cypress.env.json` in the project's client folder:

```json
{
  "TEST_USER_WITH_DESIGN_EMAIL": "your_test_email",
  "TEST_USER_WITH_DESIGN_PASSWORD": "your_test_password",
  "TEST_USER_EMAIL": "your_test_email",
  "TEST_USER_PASSWORD": "your_test_password"
}
```

The `TEST_USER_WITH_DESIGN` account should have a saved certificate design and generated certificates for batch export testing.

> **Note:** Do not commit `cypress.env.json`, as it contains test credentials. Add it to `.gitignore`.

### Test Cases

* `batch_download_shows_progress_tracker` – verifies the batch export progress tracker.
* `share_batch_download_via_email_success` – verifies successful email sharing of the batch download link.
* `file_accessible_via_email_link` – verifies the ZIP is accessible through the emailed link.

### Run Tests

From the `client` folder:

```bash
npx cypress open
```

or run Cypress in headless mode:

```bash
npx cypress run
```

## Installation

### 1. Clone the repository

```
git clone https://github.com/priakhina/certificate-generation-platform.git
cd certificate-generation-platform
```

### 2. Install dependencies

Make sure you have [Node.js](https://nodejs.org/en) installed. Run the following command from the root folder:

```
npm run install-all
```

This runs:

- `npm install` for root
- `npm install` inside `/client`
- `npm install` inside `/server`

## Local Development

Run **frontend & backend** together from the root folder:

```
npm run dev
```

This uses **concurrently** to start both servers:

- `npm run dev --prefix client` → starts Vite dev server
- `npm run dev --prefix server` → starts Express server

Frontend is available at:

```
http://localhost:5173
```

Backend is available at:

```
http://localhost:3000
```

## Build and Production

### 1. Build the frontend from root:

```
npm run build
```

### 2. Start production server from root:

```
npm start
```

In production, **the Express app serves the built React app** from `/client/dist`. The app is accessible on your server URL, e.g.:

```
http://localhost:3000
```
"# newcerificate" 
