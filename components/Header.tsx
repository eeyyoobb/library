import Link from "next/link";
import Image from "next/image";
import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";

const Header = async () => {
  const session = await auth();

  return (
    <header className="my-10 flex items-center justify-between gap-5">
      <Link href="/">
        <Image src="/icons/logo.svg" alt="logo" width={40} height={40} />
      </Link>

      <ul className="flex flex-row items-center gap-8">
        <li>
          {session?.user ? (
            <form
              action={async () => {
                "use server";
                await signOut();
              }}
            >
              <Button variant="outline">Logout</Button>
            </form>
          ) : (
            <div className="flex flex-row gap-2">
              <Button asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button className="bg-card-foreground border-primary border">
                <Link href="/sign-up" className="text-primary">
                  Sign up
                </Link>
              </Button>
            </div>
          )}
        </li>
      </ul>
    </header>
  );
};

export default Header;
