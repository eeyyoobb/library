import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";
import { AuthActions } from "@/components/AuthActions";
import SearchBar from "./searchBar";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";

const Header = async () => {
  const session = await auth();
  const userId = session?.user?.id as string;
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return (
    <header className="my-10 flex items-center justify-between gap-5">
      <Link href="/">
        <Image src="/icons/logo.svg" alt="logo" width={40} height={40} />
      </Link>

      <div className="flex flex-1 max-w-md mx-4">
        <SearchBar />
      </div>

      <ul className="flex flex-row items-center gap-8">
        <li>
          <AuthActions session={session} role={user.role} />
        </li>
      </ul>
    </header>
  );
};

export default Header;
