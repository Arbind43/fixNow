const fs = require('fs');

function replaceAllInFile(filePath, searchStr, replacement) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    fs.writeFileSync(filePath, content.split(searchStr).join(replacement));
  }
}

function replaceRegexInFile(filePath, regex, replacement) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    fs.writeFileSync(filePath, content.replace(regex, replacement));
  }
}

// Footer
replaceRegexInFile('src/components/layout/Footer.tsx', /import \{[\s\S]*?\} from 'lucide-react';/, "import { MapPin, Phone, Mail, ChevronRight } from 'lucide-react';");

// Button
replaceAllInFile('src/components/ui/Button.tsx', 'interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {', 'interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref" | "onDrag"> {');

// leftIcon
replaceAllInFile('src/pages/auth/ForgotPasswordPage.tsx', 'leftIcon={<Mail size={20} />}', '');
replaceAllInFile('src/pages/auth/LoginPage.tsx', 'leftIcon={<Mail size={20} />}', '');
replaceAllInFile('src/pages/auth/LoginPage.tsx', 'leftIcon={<Lock size={20} />}', '');
replaceAllInFile('src/pages/auth/ResetPasswordPage.tsx', 'leftIcon={<Lock size={20} />}', '');
replaceAllInFile('src/pages/auth/SignupPage.tsx', 'leftIcon={<User size={20} />}', '');
replaceAllInFile('src/pages/auth/SignupPage.tsx', 'leftIcon={<Mail size={20} />}', '');
replaceAllInFile('src/pages/auth/SignupPage.tsx', 'leftIcon={<Lock size={20} />}', '');

// CustomerDashboard
replaceAllInFile('src/pages/dashboard/CustomerDashboard.tsx', 'if (null)', 'if (false)');

// ProfilePage
replaceAllInFile('src/pages/dashboard/ProfilePage.tsx', 'src={user?.avatar}', 'src={user?.avatar || ""}');

console.log("Fixes 3 applied");
