# PrivacyPin

PrivacyPin is a secure, FOSS and self-hosted location sharing app designed to prioritize user privacy. It offers complete control over location sharing, allowing users to determine who can access their location and when. Additionally, it provides real-time notifications when someone accesses their position.

> [!IMPORTANT]
> I’m in the process of determining the foundation for this project and exploring which technologies to use for fast iterations. Currently, I’m considering **Bun** for the backend due to its comprehensive toolset (though it lacks cryptography support). For the frontend, I’m leaning toward **Capacitor** as it enables access to native mobile APIs directly from JavaScript.
>
> If you’re interested in contributing to this exciting project, I’d love to hear from you! My primary challenge lies in native development, but any assistance is greatly appreciated!

## Key Features

-   **User-Controlled Location Sharing**: Users have full control over who can view their location and when it is visible.
-   **Real-Time Access Notifications**: Receive notifications whenever someone accesses your position.
-   **Self-Hostable Server**: The server is self-hostable, ensuring that users do not rely on big tech companies to access their location data.
-   **Robust Security**: Implements strong encryption and security measures to ensure data integrity and protection against potential threats, making security a core focus of the project.

## Usage

PrivacyPin is still in early development, and the usage instructions will be provided once the app reaches a stable version. Stay tuned for updates!

## Contributing

Contributions to PrivacyPin are welcome! If you'd like to contribute, you can work on an issue, open an issue yourself or message me. Currently, I'm working on an MVP, but if you would want to help this project in literally any way, send me a message :D

## PrivacyPin Roadmap - MVP

### Phase 1: Setup and Foundation
- [x] Set up a monorepo structure to support both frontend and backend development.
- [x] Configure **Bun** as the backend runtime and **Capacitor** for frontend development.
- [x] Configure the Bun SQLite database for storing user, location and other data. (table creation, temporary API)

### Phase 2: Basic User management and UI
- [x] Implement user registration (account creation key system).
    - [x] Backend HTTP (generate key, account creation).
    - [x] Backend database (key consuming, user creation).
    - [x] Frontend HTTP (create account).
    - [x] Frontend database (save account information).
- [x] Account creation screen.

### Phase 3: Friend Management
- [ ] Implement a feature for adding friends:
    - [ ] Backend HTTP (sending friend request, accepting friend request).
    - [ ] Backend database (creating friend request, accepting friend request, creating link).
    - [ ] Frontend database to store friend data.
- [ ] Develop a user interface for adding friends
    - [ ] Display QR Code.
    - [ ] Scan QR Code (Capacitor plugin).
    - [ ] Create UI sequence for adding friends.
- [ ] Restrict location sharing to trusted friends:
    - [ ] Update APIs to restrict location sharing to friends only.
    - [ ] Add UI to manage which friends can view the user's location.

### Phase 4: Core Location sharing Features
- [ ] Implement core location sharing APIs:
    - [ ] Backend HTTP (serve ping, receive ping).
    - [ ] Backend database (store ping, get ping).
    - [ ] Frontend HTTP (send ping, get ping).
- [ ] Connect frontend to native
    - [ ] Frontend integration to send location pings (native functionality via Capacitor).
    - [ ] Frontend native access of database.

### Phase 5: Testing and Refinement
- [ ] Perform manual testing of API endpoints and frontend features.
- [ ] Resolve bugs and ensure stability.
- [ ] Collect feedback from testers to guide further development.

### Phase 6: Initial Release
- [ ] Package the app for Android and iOS using Capacitor.
- [ ] Release self-hosting guide and MVP version for early feedback.

## License

Distributed under the GNU General Public License v3.0. See `LICENSE` for more information.

## Contact

Email - dev@azom.ca\
Signal - @azom.01\
Discord - azom.
