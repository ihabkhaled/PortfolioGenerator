export interface ContactEmail {
  readonly name: string;
  readonly email: string;
  readonly subject: string;
  readonly message: string;
}

export interface PasswordResetEmail {
  readonly email: string;
  readonly resetUrl: string;
}

export interface EmailVerificationEmail {
  readonly email: string;
  readonly verificationUrl: string;
}

export interface EmailSender {
  checkReadiness: (timeoutMs: number) => Promise<void>;
  sendContact: (message: ContactEmail) => Promise<void>;
  sendPasswordReset: (message: PasswordResetEmail) => Promise<void>;
  sendEmailVerification: (message: EmailVerificationEmail) => Promise<void>;
}
