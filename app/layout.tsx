import { SignInButton, SignedIn, SignedOut } from '@clerk/nextjs';
import './globals.css';
import { Toaster } from 'sonner';
import { ConvexClientProvider } from '@/providers/convex-client-provider'; // Import ConvexProvider
import { ModalProvider } from '@/providers/modal-provider';
import { Suspense } from 'react';
import { Loading } from '@/components/auth/loading';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    
      // <ClerkProvider>
        <html lang="en">
          <body>
            <header>
              <SignedOut>
                <SignInButton />
              </SignedOut>
              <SignedIn>
                <Suspense fallback={<Loading />}>
                  <ConvexClientProvider>
                    <Toaster />
                    <ModalProvider />
                    {children}
                  </ConvexClientProvider>
                </Suspense>  
              </SignedIn>
            </header>
          </body>
        </html>
      // </ClerkProvider>

      
    
  );
}
