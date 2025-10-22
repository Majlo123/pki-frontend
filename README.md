# PKI System - Frontend

This repository contains the frontend client for a **Public Key Infrastructure (PKI)** system. This single-page application (SPA) was developed as part of the "Security in E-business Systems" course and provides a user-friendly interface for managing digital certificates and a shared password manager.

## Key Features

The frontend provides a rich, interactive user interface for all platform features:

* **User Authentication:**
    * A registration form for new users with a password strength estimator and email activation flow.
    * A secure login page featuring reCAPTCHA to prevent automated attacks.
* **Certificate Management:**
    * Role-based views for listing certificates: Admins see all, CA users see their chain, and regular users see only their own.
    * Intuitive forms for issuing Root, Intermediate, and End-Entity certificates.
    * An interface for users to upload a Certificate Signing Request (CSR) to request a new certificate.
    * Functionality to view certificate details, download them in various formats, and revoke them with a specified reason.
* **Shared Password Manager:**
    * A secure interface for End-Entity users to save and manage website credentials.
    * **Client-Side Encryption/Decryption:** Utilizes the **Web Crypto API** to decrypt passwords directly in the browser. The user's private key is selected locally and is never sent to the server.
    * A seamless process for sharing passwords, where the data is decrypted and then re-encrypted with the recipient's public key before being sent to the backend.
* **User Profile Management:**
    * A dedicated section where users can view all their active login sessions on different devices and browsers, with the ability to revoke any session remotely.

## Technology Stack

* **Framework:** Angular / React / Vue (as per specification)
* **Language:** TypeScript
* **API Communication:** Axios / Fetch API
* **Cryptography:** Web Crypto API for client-side decryption.

## Setup and Installation

1.  **Prerequisites:**
    * Node.js and npm/yarn

2.  **Installation:**
    ```bash
    npm install
    ```

3.  **Configuration:**
    * Update the API endpoint URL in the environment configuration file (e.g., `environment.ts` or `.env`) to point to your running backend server.

4.  **Running the Application:**
    ```bash
    npm start
    ```
    The application will be available at a local port (e.g., `http://localhost:4200`).
