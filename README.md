# Chat Application

A modern, real-time chat application built with Next.js, featuring authentication, real-time messaging, and a beautiful UI.

## Features

- 🔐 Authentication with Kinde
- 💬 Real-time messaging using Pusher
- 🎨 Modern UI with dark/light mode
- 🔊 Sound effects and notifications
- 😀 Emoji picker
- 📸 Image sharing with Cloudinary
- 🔄 Real-time message updates
- 📱 Responsive design
- 🎯 User preferences (sound, theme)
- 🟢 **Real-time online/offline presence with a custom WebSocket server**

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand, TanStack Query
- **Authentication**: Kinde
- **Real-time messaging**: Pusher
- **Database (Key-Value store)**: Upstash Redis
- **Custom WebSocket Presence Server**
- **Image Storage**: Cloudinary
- **UI Components**: Radix UI
- **Animations**: Framer Motion
- **Sound Effects**: use-sound

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   # Kinde Auth
   KINDE_CLIENT_ID=
   KINDE_CLIENT_SECRET=
   KINDE_ISSUER_URL=
   KINDE_SITE_URL=
   KINDE_POST_LOGIN_REDIRECT_URL=
   KINDE_POST_LOGOUT_REDIRECT_URL=

   # Pusher
   PUSHER_APP_ID=
   PUSHER_APP_KEY=
   PUSHER_APP_SECRET=
   PUSHER_APP_CLUSTER=
   NEXT_PUBLIC_PUSHER_APP_KEY=
   NEXT_PUBLIC_PUSHER_APP_CLUSTER=

   # Redis
   UPSTASH_REDIS_REST_URL=
   UPSTASH_REDIS_REST_TOKEN=

   # Cloudinary
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
   NEXT_PUBLIC_CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=
   ```

4. **Start the custom WebSocket presence server:**
   - Install the `ws` package if you haven't already:
     ```bash
     npm install ws
     ```
   - In a separate terminal, run:
     ```bash
     node presence-server.js
     ```
   - This will start the presence server on `ws://localhost:4001`.

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure


## Presence System

- The app uses a **custom WebSocket presence server** (`presence-server.js`) to track and broadcast online users in real time.
- The client connects to `ws://localhost:4001` and receives updates about which users are online.

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
