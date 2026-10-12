# Denish Makadiya — Unity Developer Portfolio

Live site: **https://denishphibonacci.github.io/PranVeda/**
Admin panel: **https://denishphibonacci.github.io/PranVeda/admin.html**

Everything runs on **GitHub Pages**. There is no server and nothing to install.
The repository itself is the database:

| File / folder | What it holds |
|---|---|
| `data.json` | profile, career, skills, site texts and all projects |
| `uploads/` | images, videos, APKs/packages and the resume uploaded from the admin panel |

When you save in the admin panel, it commits `data.json` and any uploaded files to this repo with the GitHub API.
GitHub Pages then rebuilds the site, which takes about 1 minute.

## Pages

- `index.html`: home page (hero, projects with Games / Plugins / Unity Assets filters, about, experience, skills, contact)
- `project.html?slug=…`: a project page with video, gallery, APK download, Play Store / Asset Store links
- `profile.html`: full profile / resume page (can be printed or saved as PDF)
- `admin.html`: "Dev HQ" admin panel

## First-time admin login

1. Create an access key. On GitHub go to **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**
   - **Repository access:** Only select repositories → `PranVeda`
   - **Permissions → Repository permissions → Contents:** Read and write
   - Click **Generate token** and copy it
2. Open `admin.html`, paste the key and click **Press start**.

The key is stored only in your browser. Never share it or put it in a file in this repo.

## Limits

- GitHub accepts files up to **100 MB**. For a bigger APK:
  1. In the repo, open **Releases → Draft a new release** and attach the APK.
  2. Copy the file link into the project's **External download link** field.
- Prefer **YouTube links** for gameplay videos; they keep the repo small.
- The contact form opens the visitor's email app, because Pages has no server.

## Editing on your computer

The admin panel commits straight to GitHub. If you also edit files locally, always **Fetch / Pull** in GitHub Desktop first, so you have the latest `data.json`.
