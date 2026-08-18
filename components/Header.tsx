import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";
import { AuthActions } from "@/components/AuthActions";

const Header = async () => {
  const session = await auth();

  return (
    <header className="my-10 flex items-center justify-between gap-5">
      <Link href="/">
        <Image src="/icons/logo.svg" alt="logo" width={40} height={40} />
      </Link>

      <ul className="flex flex-row items-center gap-8">
        <li>
          <AuthActions session={session} />
        </li>
      </ul>
    </header>
  );
};

export default Header;
