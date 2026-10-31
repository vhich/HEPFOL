"use client";
import { Container } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { ModeToggle } from "../ModeToggle";
import { NavbarTablines } from "./NabarTabLines";
import { NavbarUserDropdown } from "./NavbarUserDropdown";

const Navbar = () => {
  return (
    <nav
      className={
        "full border-b border-secondary fixed top-0 left-0 w-full bg-background z-100 shadow-2xl"
      }
    >
      <Container className="flex justify-between items-center">
        <Link href={"/dashboard/home"}>
          <Image
            src={"/logo_dark.svg"}
            height={100}
            width={100}
            alt="logo"
            className="dark:block hidden"
          />
          <Image
            src={"/logo_light.svg"}
            height={100}
            width={100}
            alt="logo"
            className="dark:hidden block"
          />
        </Link>
        <div className="flex items-center gap-6">
          <NavbarTablines />
          <NavbarUserDropdown />
          <ModeToggle />
        </div>
      </Container>
    </nav>
  );
};

export default Navbar;
