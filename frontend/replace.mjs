import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const frontendDir = 'd:\\My projects\\agri\\frontend\\src';

walkDir(frontendDir, function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;

    content = content.replace(/import\s+{\s*useAuth(?:\s*,\s*MOCK_USERS)?\s*}\s+from\s+['"]@\/contexts\/AuthContext['"];?/g, "import { useUser, MOCK_USERS } from '@/store';");
    content = content.replace(/import\s+{\s*useAuth\s*}\s+from\s+['"]@\/contexts\/AuthContext['"];?/g, "import { useUser } from '@/store';");
    content = content.replace(/useAuth\(\)/g, "useUser()");
    
    content = content.replace(/import\s+{\s*useDistrictContext\s*}\s+from\s+['"](?:\.\/|\@\/contexts\/)DistrictContext['"];?/g, "import { useDistrict } from '@/store';");
    content = content.replace(/useDistrictContext\(\)/g, "useDistrict()");

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log('Updated:', filePath);
    }
  }
});
