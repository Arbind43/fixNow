const fs = require('fs');

function replaceInFile(filePath, regex, replacement) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    fs.writeFileSync(filePath, content.replace(regex, replacement));
  }
}

function replaceAllInFile(filePath, regex, replacement) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    fs.writeFileSync(filePath, content.replace(regex, replacement));
  }
}

replaceInFile('src/pages/auth/ResetPasswordPage.tsx', /import axios from 'axios';\n?/, '');
replaceAllInFile('src/pages/auth/ResetPasswordPage.tsx', /fullWidth={true}/g, '');
replaceAllInFile('src/pages/auth/ResetPasswordPage.tsx', /fullWidth\s/g, ' ');
replaceAllInFile('src/pages/auth/ResetPasswordPage.tsx', /fullWidth/g, '');

replaceAllInFile('src/pages/auth/SignupPage.tsx', /Chrome/g, 'Home');
replaceAllInFile('src/pages/auth/SignupPage.tsx', /import { UserRole }/g, 'import type { UserRole }');
replaceAllInFile('src/pages/auth/SignupPage.tsx', /fullWidth={true}/g, '');
replaceAllInFile('src/pages/auth/SignupPage.tsx', /fullWidth\s/g, ' ');
replaceAllInFile('src/pages/auth/SignupPage.tsx', /fullWidth/g, '');

replaceAllInFile('src/pages/auth/VerifyEmailPage.tsx', /fullWidth={true}/g, '');
replaceAllInFile('src/pages/auth/VerifyEmailPage.tsx', /fullWidth\s/g, ' ');
replaceAllInFile('src/pages/auth/VerifyEmailPage.tsx', /fullWidth/g, '');

replaceInFile('src/pages/dashboard/AdminDashboard.tsx', /Legend,\s*/, '');

replaceInFile('src/pages/dashboard/BookingPage.tsx', /Clock,\s*/, '');
replaceAllInFile('src/pages/dashboard/BookingPage.tsx', /fullWidth={true}/g, '');
replaceAllInFile('src/pages/dashboard/BookingPage.tsx', /fullWidth\s/g, ' ');
replaceAllInFile('src/pages/dashboard/BookingPage.tsx', /fullWidth/g, '');

replaceAllInFile('src/pages/dashboard/ChatPage.tsx', /alt=/g, 'name=');
replaceAllInFile('src/pages/dashboard/ChatPage.tsx', /fullWidth={true}/g, '');
replaceAllInFile('src/pages/dashboard/ChatPage.tsx', /fullWidth\s/g, ' ');
replaceAllInFile('src/pages/dashboard/ChatPage.tsx', /fullWidth/g, '');

replaceInFile('src/pages/dashboard/CheckoutPage.tsx', /const \{ bookingId \} = useParams<.*>\(\);/, 'useParams();');

replaceInFile('src/pages/dashboard/CustomerBookingsPage.tsx', /MoreVertical,\s*/, '');
replaceAllInFile('src/pages/dashboard/CustomerBookingsPage.tsx', /alt=/g, 'name=');

replaceInFile('src/pages/dashboard/CustomerDashboard.tsx', /useEffect,\s*/, '');
replaceInFile('src/pages/dashboard/CustomerDashboard.tsx', /const \[activeBooking, setActiveBooking\] = useState<any>\(null\);/, '');
replaceAllInFile('src/pages/dashboard/CustomerDashboard.tsx', /alt=/g, 'name=');

replaceInFile('src/pages/dashboard/NotificationsPage.tsx', /Bell,\s*/, '');

replaceInFile('src/pages/dashboard/PaymentSuccessPage.tsx', /Calendar,\s*MapPin,\s*User,?\s*/, '');

replaceAllInFile('src/pages/dashboard/ProfilePage.tsx', /alt=/g, 'name=');

replaceInFile('src/pages/dashboard/TechnicianDashboard.tsx', /Calendar,\s*/, '');

replaceInFile('src/pages/dashboard/VideoCallPage.tsx', /Maximize,\s*/, '');
replaceInFile('src/pages/dashboard/VideoCallPage.tsx', /import \{ Button \} from '..\/..\/components\/ui';\n?/, '');

replaceInFile('src/pages/LandingPage.tsx', /Search,\s*/, '');
replaceAllInFile('src/pages/LandingPage.tsx', /Refrigerator,\s*WashingMachine,\s*Tv,\s*/g, '');
replaceAllInFile('src/pages/LandingPage.tsx', /Printer,\s*/g, '');
replaceAllInFile('src/pages/LandingPage.tsx', /Bike,\s*Sun,\s*TreePine,\s*Bug,\s*/g, '');

replaceInFile('src/pages/public/ServiceDetailsPage.tsx', /<Avatar src=\{tech\.avatar\} size="lg" \/>/g, '<Avatar src={tech.avatar} name={tech.name} size="lg" />');
replaceInFile('src/pages/public/TechnicianProfilePage.tsx', /<Avatar src=\{MOCK_TECH\.avatar\} className="w-32/g, '<Avatar src={MOCK_TECH.avatar} name={MOCK_TECH.name} className="w-32');

console.log("Fixes applied");
