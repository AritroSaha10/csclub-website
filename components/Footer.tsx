/**
  * Name: Footer (basic)
  * Description: Minimal footer with some text on top and some links at the bottom. Feel free to replace next/link with whatever router you're using
  * Packages needed: React Icons
  * Example: https://www.a-iac.org
*/

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="flex flex-col gap-3 p-4 bg-black">
      <p className="text-gray-400 text-sm text-center">&copy; {new Date().getFullYear()} John Fraser SS Computer Science Club. All Rights Reserved.</p>


      <hr className="mx-16 md:mx-32 lg:mx-64 border-gray-600" />

      <p className="text-gray-400 text-sm text-center">
        Made by
        {" "}
        <a href="https://www.aritrosaha.ca/" className="text-blue-500 hover:text-blue-700 duration-200">
          Aritro Saha
        </a>
        {" "}
        and
        {" "}
        <a href="https://github.com/Aryaholmukhe" className="text-blue-500 hover:text-blue-700 duration-200">
          Arya Holmukhe
        </a>
        .
      </p>
    </footer>
  );
}