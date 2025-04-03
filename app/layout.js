import "./globals.css";
import Provider from "./provider";
import SwipeNavigationProvider from "./SwipeNavigationProvider";

export const metadata = {
  title: "Flexible Database",
  description: "Developed by LWJ",
  icons: {
    icon: "/icons/icon-512x512.png", // Favicon
    apple: "/icons/icon-180x180.png", // Apple touch icon for iOS home screen
  },
  manifest: "/manifest.json", // Link to your Web App Manifest
};

export const viewport = {
  themeColor: "#000000", // Set theme color for browsers and devices here
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Provider>
          <SwipeNavigationProvider>{children}</SwipeNavigationProvider>
        </Provider>
      </body>
    </html>
  );
}
