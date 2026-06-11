const fs = require('fs');
const path = require('path');

// 1. Read .env file
const envPath = path.join(__dirname, '.env');
let token = process.env.DIGITALOCEAN_TOKEN;
let dbUrl = process.env.DATABASE_URL;

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const tokenMatch = envContent.match(/DIGITALOCEAN_TOKEN\s*=\s*["']?([^"'\r\n]+)["']?/);
  if (tokenMatch) {
    token = tokenMatch[1];
  }
  const dbMatch = envContent.match(/DATABASE_URL\s*=\s*["']?([^"'\r\n]+)["']?/);
  if (dbMatch) {
    dbUrl = dbMatch[1];
  }
}

if (!token) {
  console.error("Error: DIGITALOCEAN_TOKEN not found.");
  process.exit(1);
}

if (!dbUrl) {
  console.error("Error: DATABASE_URL not found.");
  process.exit(1);
}

// 2. Read app.json
const jsonPath = path.join(__dirname, 'app.json');
if (!fs.existsSync(jsonPath)) {
  console.error(`Error: ${jsonPath} not found.`);
  process.exit(1);
}

const appSpec = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Inject database url into secrets in memory
appSpec.spec.services.forEach(service => {
  if (service.envs) {
    service.envs.forEach(env => {
      if (env.key === 'DATABASE_URL') {
        delete env.type;
        env.value = dbUrl;
      }
    });
  }
});
if (appSpec.spec.jobs) {
  appSpec.spec.jobs.forEach(job => {
    if (job.envs) {
      job.envs.forEach(env => {
        if (env.key === 'DATABASE_URL') {
          delete env.type;
          env.value = dbUrl;
        }
      });
    }
  });
}

const appId = "11cb8a02-99fc-470e-becd-35c5c380d10d"; // The ID of the created app

console.log(`Updating DigitalOcean App Platform configuration for App ID: ${appId}...`);

// 3. Make PUT request to update the app spec
fetch(`https://api.digitalocean.com/v2/apps/${appId}`, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  },
  body: JSON.stringify(appSpec)
})
.then(async res => {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || JSON.stringify(data));
  }
  return data;
})
.then(data => {
  console.log("\n🚀 Success! DigitalOcean App configuration updated successfully.");
  console.log(`App Name: ${data.app.spec.name}`);
  console.log(`Active Deployment ID: ${data.app.active_deployment ? data.app.active_deployment.id : 'Updating...'}`);
  console.log("\nDigitalOcean will now re-build and deploy your app with the updated spec.");
})
.catch(err => {
  console.error("\n❌ Update failed:");
  console.error(err.message);
});
