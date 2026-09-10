const fs = require('fs');
const path = require('path');

const files = [
  'src/pages/portal/RetailerOrders.jsx',
  'src/pages/admin/AdminDashboard.jsx',
  'src/pages/portal/RetailerDashboard.jsx',
  'src/pages/portal/RetailerProducts.jsx',
  'src/components/PortalSidebar.jsx',
  'src/pages/public/HomePage.jsx',
  'src/pages/auth/LoginPage.jsx',
  'src/App.jsx'
];

files.forEach(f => {
  let content = fs.readFileSync(path.join(__dirname, f), 'utf-8');
  content = content.replace(/Enquiries/g, 'Orders');
  content = content.replace(/enquiries/g, 'orders');
  content = content.replace(/Enquiry/g, 'Order');
  content = content.replace(/enquiry/g, 'order');
  fs.writeFileSync(path.join(__dirname, f), content, 'utf-8');
});
console.log('Renamed enquiries to orders in files');
