const fs = require('fs');
const path = require('path');

const statsPath = path.join(__dirname, '../dist/server/stats.json');
const manifestPath = path.join(__dirname, '../dist/server/manifest.json');

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
    entry: path.join('dist/server', entryAsset.name)
  };

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('manifest.json generated and entry file updated successfully');
} catch (err) {
  console.error('Error in pre-deploy script:', err.message);
  process.exit(1);
}
