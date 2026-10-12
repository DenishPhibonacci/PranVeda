# PranVeda — Unity Developer Portfolio + Admin Panel

A portfolio website for showing your **Games**, **Plugins** and **Unity Assets**, with an admin panel to upload them.

- **Website** (`/`): hero section, filter tabs (All / Games / Plugins / Unity Assets), search, featured project, about, skills, contact form
- **Project page** (`/project/<name>`): YouTube or uploaded video, screenshot gallery with lightbox, **Download APK** button, **Google Play** badge, Asset Store / GitHub links
- **Admin panel** (`/admin`): add, edit, hide, feature and delete projects; upload cover, icon, screenshots, video, and the APK / `.unitypackage` / `.zip`; edit your profile; read contact messages; change password

**No npm install needed.** It runs on plain Node.js (version 18 or newer).

---

## How to run (Windows)

1. Install Node.js from https://nodejs.org (LTS version) if you don't have it yet.
2. Double-click **`start.bat`**, or open a terminal in this folder and run:
   ```
   node server.js
   ```
3. Open **http://localhost:3000** for the website.
4. Open **http://localhost:3000/admin** for the admin panel.

### First login
| Username | Password |
|---|---|
| `admin` | `admin123` |

⚠️ After logging in, change your password in **Admin → Account** right away.

---

## Using the admin panel

1. **Profile**: set your name, photo, tagline, about text, skills, email/phone and social links.
2. **Add New**: choose **Game**, **Plugin** or **Unity Asset**, then:
   - Fill in the title, short description and full details (`# heading`, `- list`, `**bold**` all work)
   - **Cover image** (1280×720) is shown on the cards; the **icon** is optional
   - **Screenshots**: drag and drop as many as you like
   - **Video**: a YouTube link (recommended) or an MP4 upload
   - **Download file**: an APK for games, a `.unitypackage` or `.zip` for plugins and assets. A download button appears on the website automatically.
   - **Play Store link**: when added, a "Get it on Google Play" badge appears
   - **Featured**: shows the project as a big highlight on the home page
   - **Published** off = hidden from the website (works as a draft)
3. **All Projects**: hide/show (👁), feature (★), edit or delete any project.
4. **Messages**: messages sent through the website's contact form appear here.

Download counts are tracked automatically for every project.

---

## Folder structure

```
server.js          → the server (zero dependencies)
lib/multipart.js   → file upload handling (streams large APKs straight to disk)
public/            → website + admin panel (HTML/CSS/JS)
data/db.json       → all your data (created automatically)
uploads/           → uploaded images, videos, APKs (created automatically)
```

**Backup:** keep a copy of the `data/` and `uploads/` folders. Everything you have uploaded is in those two folders.
They are listed in `.gitignore` so large APKs don't go into git.

---

## Putting it online

This site needs a Node.js server (uploads don't work on GitHub Pages or other static hosting). Options:

- **VPS** (DigitalOcean, Hostinger VPS, AWS Lightsail…): copy the folder, run `node server.js` (keep it running with `pm2 start server.js`), and put Nginx in front for your domain and HTTPS.
- **Render / Railway**: deploy the repo with start command `node server.js`. Attach a **persistent disk** mounted on the project folder, otherwise uploads are lost on every redeploy.

Settings (environment variables):

| Variable | Default | Meaning |
|---|---|---|
| `PORT` | `3000` | Server port |
| `MAX_UPLOAD_MB` | `1024` | Max size of a single upload in MB |
| `TRUST_PROXY` | (empty) | Set to `1` behind Nginx/Cloudflare so rate limits see the real visitor IP |

If you use Nginx, also set `client_max_body_size 1024M;` so big APKs can be uploaded.
