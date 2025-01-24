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
- [ ] Configure the Bun SQLite database for storing user, location and other data. (table creation, temporary API)

### Phase 2: Core Location Sharing Features
- [ ] Implement user registration (account creation key system).
- [ ] Develop core location sharing APIs:
    - [ ] Backend endpoint to receive location pings from users.
    - [ ] Backend endpoint to serve location pings to authorized users.
    - [ ] Frontend integration to send location pings (native functionality via Capacitor).
    - [ ] Frontend integration to fetch location pings from the server.
- [ ] Build a minimal frontend interface:
    - [ ] Map view to display the user's current location.
    - [ ] Basic UI for sharing location with trusted users.

## Phase 3: Friend Management
- [ ] Develop a feature for adding friends:
    - [ ] Backend API for sending and accepting friend requests.
    - [ ] Frontend database to store friend data.
    - [ ] Frontend interface for adding a friend and displaying the friend list (using QR codes for local information exchange).
- [ ] Restrict location sharing to trusted friends:
    - [ ] Update APIs to restrict location sharing to friends only.
    - [ ] Add UI to manage which friends can view the user's location.

## Phase 4: Testing and Refinement
- [ ] Perform manual testing of API endpoints and frontend features.
- [ ] Resolve bugs and ensure stability.
- [ ] Collect feedback from testers to guide further development.

### Phase 5: Initial Release
- [ ] Package the app for Android and iOS using Capacitor.
- [ ] Release self-hosting guide and MVP version for early feedback.

## License

Distributed under the GNU General Public License v3.0. See `LICENSE` for more information.

## Contact

Email - dev@azom.ca\
Signal - @azom.01\
Discord - azom.
