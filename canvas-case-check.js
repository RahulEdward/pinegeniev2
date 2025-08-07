#!/usr/bin/env node

/**
 * Canvas.tsx Specific Case Sensitivity Checker
 * Verifies all imports in Canvas.tsx match exact file cases
 */

const fs = require('fs');
const path = require('path');

function checkCanvasCaseSensitivity() {
  console.log('🔍 Checking Canvas.tsx case sensitivity for Vercel deployment...\n');
  
  const canvasFile = './src/app/builder/ui/Canvas.tsx';
  const issues = [];
  
  if (!fs.existsSync(canvasFile)) {
    console.log('❌ Canvas.tsx file not found!');
    return false;
  }
  
  const content = fs.readFileSync(canvasFile, 'utf8');
  const lines = content.split('\n');
  
  // Define expected imports and their file paths
  const expectedImports = [
    { import: './ThemeProvider', file: 'src/app/builder/ui/ThemeProvider.tsx' },
    { import: './Sidebar', file: 'src/app/builder/ui/Sidebar.tsx' },
    { import: './Toolbar', file: 'src/app/builder/ui/Toolbar.tsx' },
    { import: './N8nNode', file: 'src/app/builder/ui/N8nNode.tsx' },
    { import: './ConnectionLine', file: 'src/app/builder/ui/ConnectionLine.tsx' },
    { import: './ValidationStatus', file: 'src/app/builder/ui/ValidationStatus.tsx' },
    { import: './UserManual', file: 'src/app/builder/ui/UserManual.tsx' },
    { import: './ConnectionInstructions', file: 'src/app/builder/ui/ConnectionInstructions.tsx' },
    { import: './AIAssistant', file: 'src/app/builder/ui/AIAssistant.tsx' },
    { import: '../utils/coordinate-system', file: 'src/app/builder/utils/coordinate-system.ts' },
    { import: '../utils/connection-manager', file: 'src/app/builder/utils/connection-manager.ts' },
    { import: '../utils/simple-connection-handler', file: 'src/app/builder/utils/simple-connection-handler.ts' },
    { import: '../utils/mouse-event-manager', file: 'src/app/builder/utils/mouse-event-manager.ts' },
    { import: '../enhanced-pinescript-generator', file: 'src/app/builder/enhanced-pinescript-generator.ts' },
    { import: '../utils/node-positioning', file: 'src/app/builder/utils/node-positioning.ts' }
  ];
  
  console.log('📋 Checking Canvas.tsx imports:\n');
  
  expectedImports.forEach(({ import: importPath, file }) => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${importPath} → ${file}`);
    } else {
      console.log(`❌ ${importPath} → ${file} (NOT FOUND)`);
      issues.push({ import: importPath, file, error: 'File not found' });
    }
  });
  
  // Check for actual imports in the file
  console.log('\n📄 Scanning actual imports in Canvas.tsx:\n');
  
  lines.forEach((line, lineNum) => {
    const importMatch = line.match(/import.*from\s+['"](\.[^'"]+)['"]/);
    if (importMatch) {
      const importPath = importMatch[1];
      const basePath = path.dirname(canvasFile);
      const fullPath = path.resolve(basePath, importPath);
      
      // Check possible extensions
      const possibleExtensions = ['.ts', '.tsx', '.js', '.jsx'];
      let found = false;
      let foundFile = '';
      
      for (const ext of possibleExtensions) {
        const testPath = fullPath + ext;
        if (fs.existsSync(testPath)) {
          found = true;
          foundFile = testPath;
          break;
        }
      }
      
      if (found) {
        console.log(`✅ Line ${lineNum + 1}: ${importPath} → ${foundFile}`);
      } else {
        console.log(`❌ Line ${lineNum + 1}: ${importPath} → NOT FOUND`);
        issues.push({
          line: lineNum + 1,
          import: importPath,
          error: 'File not found'
        });
      }
    }
  });
  
  console.log('\n' + '='.repeat(60));
  
  if (issues.length === 0) {
    console.log('🎉 SUCCESS: All Canvas.tsx imports are case-correct!');
    console.log('🚀 Canvas.tsx is ready for Vercel deployment!');
    return true;
  } else {
    console.log('❌ ISSUES FOUND:');
    issues.forEach(issue => {
      if (issue.line) {
        console.log(`   Line ${issue.line}: ${issue.import} - ${issue.error}`);
      } else {
        console.log(`   ${issue.import} - ${issue.error}`);
      }
    });
    return false;
  }
}

if (require.main === module) {
  const success = checkCanvasCaseSensitivity();
  process.exit(success ? 0 : 1);
}

module.exports = { checkCanvasCaseSensitivity };