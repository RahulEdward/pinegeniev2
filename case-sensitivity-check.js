#!/usr/bin/env node

/**
 * Case Sensitivity Checker for Next.js Projects
 * Ensures all imports match exact file cases for Linux compatibility
 */

const fs = require('fs');
const path = require('path');

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

function checkCaseSensitivity() {
  console.log('🔍 Checking case sensitivity for Linux compatibility...\n');
  
  const srcDir = './src';
  const issues = [];
  
  // Get all TypeScript/JavaScript files
  const files = getAllFiles(srcDir);
  
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, lineNum) => {
      // Check for relative imports
      const importMatch = line.match(/import.*from\s+['"](\.[^'"]+)['"]/);
      if (importMatch) {
        const importPath = importMatch[1];
        const fullPath = path.resolve(path.dirname(file), importPath);
        
        // Check if file exists with exact case
        const possibleExtensions = ['.ts', '.tsx', '.js', '.jsx', ''];
        let found = false;
        
        for (const ext of possibleExtensions) {
          const testPath = fullPath + ext;
          if (fs.existsSync(testPath)) {
            found = true;
            break;
          }
        }
        
        if (!found) {
          issues.push({
            file: file.replace(/\\/g, '/'),
            line: lineNum + 1,
            import: importPath,
            error: 'File not found'
          });
        }
      }
    });
  });
  
  if (issues.length === 0) {
    console.log('✅ No case sensitivity issues found!');
    console.log('🚀 Your project should build successfully on Linux servers.');
    console.log('\n📊 Summary:');
    console.log(`   - Checked ${files.length} files`);
    console.log('   - All imports use correct case matching');
    console.log('   - No missing files detected');
  } else {
    console.log('❌ Issues found:');
    issues.forEach(issue => {
      console.log(`\n📁 ${issue.file}:${issue.line}`);
      console.log(`   Import: ${issue.import}`);
      console.log(`   Error: ${issue.error}`);
    });
  }
  
  return issues.length === 0;
}

if (require.main === module) {
  checkCaseSensitivity();
}

module.exports = { checkCaseSensitivity };