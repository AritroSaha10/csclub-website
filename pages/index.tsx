import TitleHead from 'components/TitleHead'
import Link from 'next/link'
import type { NextPage } from 'next'

const Home: NextPage = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[80vh]">
      <TitleHead name="Home" />

      <h1 className="text-4xl text-center mb-4 font-semibold text-white">
        Under Construction <span className="font-normal">🔨</span>
      </h1>

      <p className="text-xl text-center mb-4 text-gray-300">
        Sorry about the inconvienence, but this website is still in construction.
      </p>

      <p className="text-xl text-center mb-4 text-gray-300">
        Looking for the attendance tracker? Click
        {" "}
        <Link href="/attn">
          <a className="text-blue-500 duration-75 hover:underline active:text-blue-700">
            here
          </a>
        </Link>
        .
      </p>
    </div>
  )
}

export default Home
