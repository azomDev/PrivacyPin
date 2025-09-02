# PrivacyPin

PrivacyPin is (going to be) a secure self-hosted location sharing app designed to prioritize user privacy. It offers complete control over location sharing, allowing users to determine who can access their location and when. PrivacyPin is federated, so different servers can interoperate and users are not locked into a single provider. Additionally, it might provide real-time notifications when someone accesses their position (that will require self-hosted notifications, which I'm unsure how much of a pain that is).


> [!IMPORTANT]
> I’m in the process of rapidly iterating to establish a base on which testing can begin. The current tech stack is NOT the final one.
>
> If you’re interested in contributing to this exciting project, I’d love to hear from you! My primary challenge lies in native mobile development, but any assistance is greatly appreciated!

## Key Features

-   **User-Controlled Location Sharing**: Users have full control over who can view their location and when it is visible.
-   **Real-Time Access Notifications**: Receive notifications whenever someone accesses your position. (if I ever feel like adding that)
-   **Self-Hostable Server**: The server is self-hostable, ensuring that users do not rely on big tech companies to access their location data.
-   **Federated Architecture**: Servers can interoperate, allowing people on different servers to share locations with each other.
-   **Robust Security**: Implements strong encryption and security measures to ensure data integrity and protection against potential threats, making security a core focus of the project.

## Usage

PrivacyPin is still in early development, and the usage instructions will be provided once the app reaches a stable version. Stay tuned for updates!

## Roadmap

### **Phase 1 — Core Functionality (MVP)**

* Android mobile app.
* Self-hostable backend server with basic API functionality.
* On/off control for location sharing.
* Simple UI for sharing location.
* Basic in-app location sharing.

### **Phase 2 — Security & Usability Enhancements**

* Basic user authentication system.
* Basic background location service for location sharing
* Improved and polished UI/UX for the mobile app.
* Server-side data validation.
* More robust API design and error handling on the client.
* End-to-end encryption (e2e).
* Account creation via QR code.
* Adding friends via QR code.

### **Phase 3 — Advanced Privacy & Architecture**

* Utilization of trusted computing environments for key storing and computing.
* Federation/multi-server support.
* Fine-grained control over location sharing.

### **Phase 4 — Extended Security Features**

* Fingerprint/PIN app access.
* Real-time access notifications.

## Contributing

Contributions to PrivacyPin are welcome! If you'd like to contribute, you can work on an issue, open an issue yourself or message me. Currently, I'm working on an MVP, but if you would want to help this project in literally any way, send me a message :D

## Getting Started (Development)

### Prerequisites

Make sure you have the following installed:

* [Bun](https://bun.sh/docs/installation)
* [Rust (Cargo)](https://www.rust-lang.org/tools/install)

### Setup

```bash
git clone https://github.com/azomDev/PrivacyPin.git
cd PrivacyPin
bun i
```

### Running the Environment

Open **3–4 terminals** and run the following in each:

```bash
# Terminal 1
bun run vite

# Terminal 2
bun run app

# Terminal 3
bun run server

# (Optional) Terminal 4 — to run another app instance
bun run app
```

## Contact

Email : azomDev@pm.me\
Signal : @azom.01\
Discord : _azom
