import Nav from "./components/Nav";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div> 
      <Nav />
      <main className="flex-1">{children}</main>
    </div>
  );
}
