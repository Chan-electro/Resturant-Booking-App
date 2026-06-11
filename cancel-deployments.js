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
  process.exit(1);
}

const appId = "11cb8a02-99fc-470e-becd-35c5c380d10d";

console.log(`Checking deployments for App ID: ${appId}...`);

fetch(`https://api.digitalocean.com/v2/apps/${appId}/deployments`, {
  headers: {
    "Authorization": `Bearer ${token}`
  }
})
.then(res => res.json())
.then(async data => {
  const activeDeployments = data.deployments.filter(d => 
    ["PENDING_BUILD", "BUILDING", "PENDING_DEPLOY", "DEPLOYING"].includes(d.phase)
  );

  console.log(`Found ${activeDeployments.length} active deployment(s).`);

  for (const dep of activeDeployments) {
    console.log(`Cancelling deployment ${dep.id} (Phase: ${dep.phase})...`);
    const cancelRes = await fetch(`https://api.digitalocean.com/v2/apps/${appId}/deployments/${dep.id}/cancel`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    if (cancelRes.ok) {
      console.log(`Successfully cancelled ${dep.id}`);
    } else {
      const errData = await cancelRes.json();
      console.error(`Failed to cancel ${dep.id}: ${errData.message}`);
    }
  }
})
.catch(err => {
  console.error("Error:", err.message);
});
