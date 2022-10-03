import Link from 'next/link'

export default function Page404() {
  return (
    <div className="flex flex-col flex-grow justify-center" key="page-404">
      <div className="flex flex-col p-8">
        <h1 className="text-8xl text-center mb-2 font-semibold text-blue-500">
          404
        </h1>
        <h2 className="text-3xl text-center mb-6 text-black dark:text-white">
          Page Not Found
        </h2>

        <p className="text-xl text-center mb-6 text-gray-700 dark:text-gray-300">
          Sorry, the page that you&apos;re looking for does not exist.
        </p>

        <div className="self-center">
          <Link href="/">
            <a className="text-md bg-blue-500 hover:bg-blue-600 duration-75 text-white px-4 py-2 rounded-lg font-semibold">
              Take me home!
            </a>
          </Link>
        </div>
      </div>
    </div>
  )
}