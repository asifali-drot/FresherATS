import AntigravityBackground from "@/components/AntigravityBackground";
import Header from "@/components/Header";
import Footer from "@/components/Footer";


export default function WebsiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* Antigravity Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none opacity-20">
        <AntigravityBackground
          count={350}
          color="#9333EA"
          particleSize={1.1}
          magnetRadius={10}
          autoAnimate={true}
        />
      </div>

      <div className="flex min-h-screen flex-col relative z-0">
        <Header />

        <main className="flex-1">
          {children}
        </main>

        <Footer />
      </div>
    </>
  );
}
