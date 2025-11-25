#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// ألوان للطباعة في Terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// إنشاء واجهة للقراءة من المستخدم
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// التحقق من وجود Git
function checkGitInstalled() {
  try {
    execSync('git --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// التحقق من وجود مجلدات Frontend و Backend
function checkProjectStructure() {
  const currentDir = process.cwd();
  const hasFrontend = fs.existsSync(path.join(currentDir, 'frontend')) || 
                      fs.existsSync(path.join(currentDir, 'Frontend')) ||
                      fs.existsSync(path.join(currentDir, 'client')) ||
                      fs.existsSync(path.join(currentDir, 'Client'));
  
  const hasBackend = fs.existsSync(path.join(currentDir, 'backend')) || 
                     fs.existsSync(path.join(currentDir, 'Backend')) ||
                     fs.existsSync(path.join(currentDir, 'server')) ||
                     fs.existsSync(path.join(currentDir, 'Server'));

  return { hasFrontend, hasBackend, currentDir };
}

// التحقق من وجود مستودع Git
function isGitRepo() {
  return fs.existsSync(path.join(process.cwd(), '.git'));
}

// إنشاء مستودع على GitHub باستخدام GitHub API
async function createGitHubRepo(repoName, token, isPrivate = false) {
  try {
    const https = require('https');
    
    return new Promise((resolve, reject) => {
      const data = JSON.stringify({
        name: repoName,
        private: isPrivate,
        auto_init: false
      });

      const options = {
        hostname: 'api.github.com',
        path: '/user/repos',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length,
          'Authorization': `token ${token}`,
          'User-Agent': 'GitHub-Setup-Script'
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          if (res.statusCode === 201) {
            const repo = JSON.parse(responseData);
            resolve(repo);
          } else if (res.statusCode === 422) {
            // المستودع موجود بالفعل
            resolve(null);
          } else {
            reject(new Error(`فشل إنشاء المستودع: ${res.statusCode} - ${responseData}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(data);
      req.end();
    });
  } catch (error) {
    throw new Error(`خطأ في الاتصال بـ GitHub API: ${error.message}`);
  }
}

// الحصول على اسم المستخدم من GitHub
async function getGitHubUsername(token) {
  try {
    const https = require('https');
    
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.github.com',
        path: '/user',
        method: 'GET',
        headers: {
          'Authorization': `token ${token}`,
          'User-Agent': 'GitHub-Setup-Script'
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          if (res.statusCode === 200) {
            const user = JSON.parse(responseData);
            resolve(user.login);
          } else {
            reject(new Error(`فشل الحصول على معلومات المستخدم: ${res.statusCode}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.end();
    });
  } catch (error) {
    throw new Error(`خطأ في الاتصال بـ GitHub API: ${error.message}`);
  }
}

// تنفيذ أمر Git
function runGitCommand(command, options = {}) {
  try {
    execSync(command, { 
      stdio: options.silent ? 'ignore' : 'inherit',
      cwd: options.cwd || process.cwd()
    });
    return true;
  } catch (error) {
    if (!options.ignoreError) {
      throw error;
    }
    return false;
  }
}

// الدالة الرئيسية
async function main() {
  try {
    log('\n🚀 بدء إعداد المستودع على GitHub...\n', 'cyan');

    // 1. التحقق من وجود Git
    log('1️⃣  التحقق من تثبيت Git...', 'blue');
    if (!checkGitInstalled()) {
      log('❌ Git غير مثبت! يرجى تثبيت Git أولاً.', 'red');
      process.exit(1);
    }
    log('✅ Git مثبت', 'green');

    // 2. التحقق من بنية المشروع
    log('\n2️⃣  التحقق من بنية المشروع...', 'blue');
    const { hasFrontend, hasBackend, currentDir } = checkProjectStructure();
    
    if (!hasFrontend && !hasBackend) {
      log('⚠️  تحذير: لم يتم العثور على مجلدات Frontend أو Backend واضحة.', 'yellow');
      const continueAnyway = await question('هل تريد المتابعة على أي حال؟ (y/n): ');
      if (continueAnyway.toLowerCase() !== 'y') {
        log('تم الإلغاء.', 'yellow');
        process.exit(0);
      }
    } else {
      log(`✅ تم العثور على: ${hasFrontend ? 'Frontend' : ''} ${hasBackend ? 'Backend' : ''}`, 'green');
    }

    // 3. الحصول على معلومات من المستخدم
    log('\n3️⃣  جمع المعلومات المطلوبة...', 'blue');
    
    const repoName = await question('📝 اسم المستودع على GitHub: ');
    if (!repoName || repoName.trim() === '') {
      log('❌ اسم المستودع مطلوب!', 'red');
      process.exit(1);
    }

    const token = await question('🔑 GitHub Personal Access Token: ');
    if (!token || token.trim() === '') {
      log('❌ Token مطلوب! يمكنك إنشاء واحد من: https://github.com/settings/tokens', 'red');
      process.exit(1);
    }

    const isPrivate = await question('🔒 هل تريد المستودع خاص؟ (y/n): ');
    const privateRepo = isPrivate.toLowerCase() === 'y';

    const useSSH = await question('🔐 هل تريد استخدام SSH بدلاً من HTTPS؟ (y/n): ');
    const useSSHRepo = useSSH.toLowerCase() === 'y';

    // 4. الحصول على اسم المستخدم
    log('\n4️⃣  الحصول على معلومات GitHub...', 'blue');
    let username;
    try {
      username = await getGitHubUsername(token);
      log(`✅ المستخدم: ${username}`, 'green');
    } catch (error) {
      log(`❌ ${error.message}`, 'red');
      process.exit(1);
    }

    // 5. إنشاء المستودع على GitHub
    log('\n5️⃣  إنشاء المستودع على GitHub...', 'blue');
    let repoCreated = false;
    try {
      const repo = await createGitHubRepo(repoName, token, privateRepo);
      if (repo) {
        log(`✅ تم إنشاء المستودع: ${repoName}`, 'green');
        repoCreated = true;
      } else {
        log(`⚠️  المستودع ${repoName} موجود بالفعل، سيتم استخدامه.`, 'yellow');
      }
    } catch (error) {
      log(`❌ ${error.message}`, 'red');
      process.exit(1);
    }

    // 6. تهيئة Git (إذا لم يكن موجودًا)
    log('\n6️⃣  تهيئة Git...', 'blue');
    if (!isGitRepo()) {
      runGitCommand('git init');
      log('✅ تم تهيئة Git', 'green');
    } else {
      log('✅ Git موجود بالفعل', 'green');
    }

    // 7. إضافة الملفات وعمل Commit
    log('\n7️⃣  إضافة الملفات وعمل Commit...', 'blue');
    
    // إنشاء .gitignore إذا لم يكن موجودًا
    if (!fs.existsSync('.gitignore')) {
      const gitignoreContent = `node_modules/
.env
.DS_Store
dist/
build/
*.log
.vscode/
.idea/
`;
      fs.writeFileSync('.gitignore', gitignoreContent);
      log('✅ تم إنشاء ملف .gitignore', 'green');
    }

    runGitCommand('git add .');
    log('✅ تم إضافة الملفات', 'green');

    // التحقق من وجود تغييرات للـ commit
    try {
      runGitCommand('git diff --cached --quiet', { silent: true, ignoreError: true });
      runGitCommand('git commit -m "Initial commit"');
      log('✅ تم عمل Commit', 'green');
    } catch (error) {
      log('⚠️  لا توجد تغييرات للـ commit', 'yellow');
    }

    // 8. ربط المشروع بـ GitHub
    log('\n8️⃣  ربط المشروع بـ GitHub...', 'blue');
    
    const remoteUrl = useSSHRepo 
      ? `git@github.com:${username}/${repoName}.git`
      : `https://github.com/${username}/${repoName}.git`;

    // إزالة remote الموجود إذا كان موجودًا
    runGitCommand('git remote remove origin', { silent: true, ignoreError: true });
    
    runGitCommand(`git remote add origin ${remoteUrl}`);
    log(`✅ تم ربط المشروع بـ: ${remoteUrl}`, 'green');

    // 9. دفع الملفات
    log('\n9️⃣  دفع الملفات إلى GitHub...', 'blue');
    
    try {
      // محاولة الحصول على اسم الفرع الحالي
      let branchName = 'main';
      try {
        branchName = execSync('git branch --show-current', { encoding: 'utf-8' }).trim() || 'main';
      } catch (error) {
        // إذا لم يكن هناك فرع، استخدم main
        branchName = 'main';
      }

      // إنشاء فرع main إذا لم يكن موجودًا
      runGitCommand(`git branch -M ${branchName}`, { ignoreError: true });

      // Push مع تعيين upstream
      runGitCommand(`git push -u origin ${branchName}`);
      log(`✅ تم دفع الملفات إلى فرع ${branchName}`, 'green');
    } catch (error) {
      log('❌ فشل دفع الملفات. قد تحتاج إلى دفعها يدويًا.', 'red');
      log(`   استخدم: git push -u origin main`, 'yellow');
    }

    // 10. طباعة رابط المستودع
    log('\n' + '='.repeat(50), 'cyan');
    log('\n✅ تم إعداد المستودع بنجاح!\n', 'green');
    log(`🔗 رابط المستودع:`, 'cyan');
    log(`   https://github.com/${username}/${repoName}`, 'blue');
    log('\n' + '='.repeat(50) + '\n', 'cyan');

  } catch (error) {
    log(`\n❌ خطأ: ${error.message}`, 'red');
    process.exit(1);
  } finally {
    rl.close();
  }
}

// تشغيل السكربت
main();

