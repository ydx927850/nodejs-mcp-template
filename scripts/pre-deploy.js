const fs = require('fs');
const path = require('path');

const deployId = process.env.PLATFORM_ID;
if (!deployId) {
  console.error('PLATFORM_ID environment variable is required. Usage: PLATFORM_ID=<id> tnpm run deploy');
  process.exit(1);
}

const statsPath = path.join(__dirname, '../dist/server/stats.json');
const manifestPath = path.join(__dirname, '../dist/manifest.json');

function prependEntryHeader(entryPath) {
  const content = fs.readFileSync(entryPath, 'utf-8');
  const header = `process.env.NODE_PATH = '/var/task';
require('module').Module._initPaths();
`;
  fs.writeFileSync(entryPath, header + content);
}

try {
  const stats = JSON.parse(fs.readFileSync(statsPath, 'utf-8'));
  
  // Find the entry file from assets. 
  const entryAsset = stats.assets.find(asset => asset.name.endsWith('.js') && !asset.name.endsWith('.map'));
  
  if (!entryAsset) {
    console.error('Could not find entry asset in stats.json');
    process.exit(1);
  }

  const entryPath = path.join(__dirname, '../dist/server', entryAsset.name);
  prependEntryHeader(entryPath);

  const manifest = {
    version: 1,
    server: {
      entry: entryAsset.name,
    }
  };

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  // Generate dist/client/index.html
  const clientDir = path.join(__dirname, '../dist/client');
  fs.mkdirSync(clientDir, { recursive: true });
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hello World</title>
</head>
<body>
  <h1>Hello World</h1>
</body>
</html>`;
  fs.writeFileSync(path.join(clientDir, 'index.html'), html);

  // Generate unio.config.json
  const unioConfig = {
    platformId: deployId
  };
  fs.writeFileSync(path.join(__dirname, '../dist/unio.config.json'), JSON.stringify(unioConfig, null, 2));

  console.log('manifest.json generated, entry file updated, unio.config.json created, and client index.html created successfully');
} catch (err) {
  console.error('Error in pre-deploy script:', err.message);
  process.exit(1);
}
