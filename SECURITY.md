# SECURITY.md

## 📢 Security Policy for Verau for Men's

Thank you for your interest in helping secure **Verau for Men's** — a modern e-commerce platform for men’s clothing, built with React, Node.js, Tailwind CSS, and integrated with PayPal and Mercado Pago.

---

## 🛡️ Supported Versions

We actively maintain the following versions:

| Version | Supported |
|---------|-----------|
| Latest  | ✅ Yes     |
| Older   | ❌ No      |

---

## 🚨 Reporting a Vulnerability

If you discover a security issue in the codebase, **please report it responsibly** by emailing:

📧 **security@verauformen.com**

We ask that you do **not** publicly disclose the vulnerability until we have had a chance to address it.

Your report should include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if available)

---

## 🔐 Security Measures

Our team follows best practices to protect users and their data, including:

- **Input validation & sanitization** on both frontend and backend
- **HTTPS enforcement** across the platform
- **JWT-based authentication** with token expiration
- **Rate limiting** and brute-force protection on login endpoints
- **Environment variable encryption** for keys and secrets
- **CSRF protection** where applicable
- **Secure payment processing** through PayPal and Mercado Pago using official SDKs and server-side verification

---

## 🧾 Payments

We **never store credit card numbers** or CVV codes on our servers. All payment processing is handled securely via:

- [PayPal Developer](https://developer.paypal.com/docs/api/overview/)
- [Mercado Pago API](https://www.mercadopago.com.pe/developers/en/)

Transactions are encrypted and verified server-side before processing order confirmations.

---

## 🔄 Dependency Management

We regularly audit our dependencies using:

- `npm audit`
- GitHub Dependabot alerts
- Manual reviews before major deployments

---

## 🧪 Penetration Testing & Audits

- Internal testing is conducted prior to major releases.
- We welcome ethical hackers to submit responsible disclosures under our guidelines.

---

## 📅 Last Updated

**June 15, 2025**

---

## ❤️ Thanks

Thank you to all contributors and security researchers who help keep Verau for Men's secure!

