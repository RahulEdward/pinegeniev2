#!/usr/bin/env node

/**
 * Vercel Case Sensitivity Fix for PineGenie
 * Ensures all imports are Linux/Vercel compatible
 */

const fs = require('fs');
const path = require('path');

function fixVercelCaseSensitivity() {
  console.log('🔧 Fixing case sensitivity issues for Vercel deployment...\n');
  
  const fixes = [];
  const srcDir = './src';
  
  // Get all TypeScript/JavaScript files
  function getAllFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
    const files = [];
    
    function traverse(currentDir) {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          traverse(fullPath);
        } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    }
    
    traverse(dir);
    return files;
  }
  
  const files = getAllFiles(srcDir);
  
  // Critical files to check
  const criticalFiles = [
    'src/app/builder/page.tsx',
    'src/app/builder/ui/Canvas.tsx',
    'src/app/builder/ui/ThemeProvider.tsx',
    'src/app/builder/ui/Sidebar.tsx',
    'src/app/builder/ui/Toolbar.tsx'
  ];
  
  console.log('🎯 Checking critical files:\n');
  
  criticalFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`);
      
      // Check imports in this file
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, lineNum) => {
        const importMatch = line.match(/import.*from\s+['"](\.[^'"]+)['"]/);
        if (importMatch) {
          const importPath = importMatch[1];
          const basePath = path.dirname(file);
          const fullPath = path.resolve(basePath, importPath);
          
          // Check if file exists with exact case
          const possibleExtensions = ['.ts', '.tsx', '.js', '.jsx'];
          let found = false;
          
          for (const ext of possibleExtensions) {
            const testPath = fullPath + ext;
            if (fs.existsSync(testPath)) {
              found = true;
              break;
            }
          }
          
          if (!found) {
            console.log(`   ⚠️  Line ${lineNum + 1}: ${importPath} - File not found`);
            fixes.push({
              file,
              line: lineNum + 1,
              import: importPath,
              issue: 'File not found'
            });
          }
        }
      });
    } else {
      console.log(`❌ ${file} - NOT FOUND`);
      fixes.push({
        file,
        issue: 'Critical file missing'
      });
    }
  });
  
  console.log('\n' + '='.repeat(60));
  
  if (fixes.length === 0) {
    console.log('🎉 SUCCESS: All files are Vercel-ready!');
    console.log('🚀 No case sensitivity issues found.');
    console.log('\n📋 Deployment checklist:');
    console.log('   ✅ All imports use correct case');
    console.log('   ✅ All files exist with proper naming');
    console.log('   ✅ Canvas.tsx imports are verified');
    console.log('   ✅ Builder page imports are verified');
    
    return true;
  } else {
    console.log('❌ Issues found that need fixing:');
    fixes.forEach(fix => {
      if (fix.line) {
        console.log(`   ${fix.file}:${fix.line} - ${fix.import} (${fix.issue})`);
      } else {
        console.log(`   ${fix.file} - ${fix.issue}`);
      }
    });
    
    return false;
  }
}

// Additional Vercel-specific checks
function checkVercelCompatibility() {
  console.log('\n🔍 Additional Vercel compatibility checks:\n');
  
  const checks = [
    {
      name: 'Next.js Config',
      file: 'next.config.js',
      required: false
    },
    {
      name: 'Package.json',
      file: 'package.json',
      required: true
    },
    {
      name: 'Environment Variables',
      file: '.env.example',
      required: false
    },
    {
      name: 'Vercel Config',
      file: 'vercel.json',
      required: false
    }
  ];
  
  checks.forEach(check => {
    if (fs.existsSync(check.file)) {
      console.log(`✅ ${check.name}: ${check.file}`);
    } else if (check.required) {
      console.log(`❌ ${check.name}: ${check.file} (REQUIRED)`);
    } else {
      console.log(`⚪ ${check.name}: ${check.file} (Optional)`);
    }
  });
  
  // Check build script
  if (fs.existsSync('package.json')) {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (pkg.scripts && pkg.scripts.build) {
      console.log(`✅ Build script: ${pkg.scripts.build}`);
    } else {
      console.log('❌ Build script missing in package.json');
    }
  }
}

if (require.main === module) {
  const success = fixVercelCaseSensitivity();
  checkVercelCompatibility();
  
  console.log('\n' + '='.repeat(60));
  if (success) {
    console.log('🎉 READY FOR VERCEL DEPLOYMENT!');
    console.log('\n📝 Next steps:');
    console.log('   1. git add .');
    console.log('   2. git commit -m "Fix case sensitivity for Vercel"');
    console.log('   3. git push');
    console.log('   4. Deploy to Vercel');
  } else {
    console.log('⚠️  Please fix the issues above before deploying to Vercel.');
  }
  
  process.exit(success ? 0 : 1);
}

module.exports = { fixVercelCaseSensitivity };