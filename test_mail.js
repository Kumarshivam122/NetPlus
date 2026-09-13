import emailUtils from './backend/utils/email.js';

async function run() {
  console.log('Sending dummy mail to Mailtrap...');
  const success = await emailUtils.sendWelcomeEmail('test@example.com', 'Dummy User');
  if (success) {
    console.log('Successfully sent dummy email!');
  } else {
    console.error('Failed to send dummy email.');
  }
  process.exit(0);
}

run();
