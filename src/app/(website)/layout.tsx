import { createClient } from "@/lib/supabase/server";
import { logoutAction } from "./(auth)/actions";
import Antigravity from "@/components/Antigravity";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default async function WebsiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <>
      {/* Antigravity Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none opacity-20">
        <Antigravity
          count={350}
          color="#9333EA"
          particleSize={1.1}
          magnetRadius={10}
          autoAnimate={true}
        />
      </div>

      <div className="flex min-h-screen flex-col relative z-0">
        <Header user={user} logoutAction={logoutAction} />

        <main className="flex-1">
          {children}
        </main>

        <Footer />
      </div>
    </>
  );
}
