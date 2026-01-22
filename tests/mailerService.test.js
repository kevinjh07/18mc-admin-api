require('dotenv').config();

jest.mock('sib-api-v3-sdk', () => ({
  ApiClient: {
    instance: {
      authentications: {
        'api-key': { apiKey: '' },
      },
    },
  },
  TransactionalEmailsApi: jest.fn().mockImplementation(() => ({
    sendTransacEmail: jest.fn().mockResolvedValue({}),
  })),
  SendSmtpEmail: jest.fn().mockImplementation(() => ({
    subject: '',
    htmlContent: '',
    sender: {},
    to: [],
  })),
}));

const { sendPasswordResetEmail } = require('../services/mailerService');
const fs = require('fs');
const path = require('path');
const SibApiV3Sdk = require('sib-api-v3-sdk');

jest.mock('fs');
jest.mock('path');

describe('Mailer Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email successfully', async () => {
      const mockHtmlContent = '<html>{{account_name}} {{account_email}} {{action_url}}</html>';

      fs.readFileSync.mockReturnValue(mockHtmlContent);
      path.join.mockReturnValue('/path/to/template.html');

      process.env.FRONTEND_URL = 'http://frontend.com';
      process.env.EMAIL_FROM = 'noreply@example.com';

      await expect(sendPasswordResetEmail('User Name', 'user@example.com', 'abc123')).resolves.not.toThrow();

      expect(fs.readFileSync).toHaveBeenCalledWith('/path/to/template.html', 'utf8');
      expect(path.join).toHaveBeenCalledWith(expect.any(String), '../templates/reset-password.html');
    });

    it('should handle file read error', async () => {
      fs.readFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      await expect(sendPasswordResetEmail('User Name', 'user@example.com', 'abc123')).rejects.toThrow('File not found');
    });
  });
});