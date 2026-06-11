const fs = require('fs');
const path = require('path');

// 1. Read .env file
const envPath = path.join(__dirname, '.env');
let token = process.env.DIGITALOCEAN_TOKEN;

if (!token && fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/DIGITALOCEAN_TOKEN\s*=\s*["']?([^"'\r\n]+)["']?/);
  if (match) {
    token = match[1];
  }
}

if (!token) {
  console.error("Error: DIGITALOCEAN_TOKEN not found in environment or .env file.");
  console.log("Please create a .env file in the root directory with:");
  console.log("DIGITALOCEAN_TOKEN=your_token_here");
  process.exit(1);
}

// 2. Read app.json
const jsonPath = path.join(__dirname, 'app.json');
if (!fs.existsSync(jsonPath)) {
  console.error(`Error: ${jsonPath} not found.`);
  process.exit(1);
}

const appSpec = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// 3. Make POST request to DigitalOcean
console.log("Connecting to DigitalOcean App Platform...");
fetch("https://api.digitalocean.com/v2/apps", {
  method: "POST",
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
  console.log("\n🚀 Success! DigitalOcean App creation initiated.");
  console.log(`App Name: ${data.app.spec.name}`);
  console.log(`App ID: ${data.app.id}`);
  console.log(`Live URL (Web): ${data.app.live_url || 'Generating...'}`);
  console.log("\nDigitalOcean is now building and deploying your code from GitHub.");
  console.log("It will take about 5-8 minutes to complete.");
})
.catch(err => {
  console.error("\n❌ Deployment failed:");
  console.error(err.message);
});
